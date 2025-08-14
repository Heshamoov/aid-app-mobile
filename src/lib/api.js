import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Point this to your PocketBase instance
export const pb = new PocketBase('http://127.0.0.1:8090');

// Create stores for authentication and offline data
export const authStore = writable({ user: null });
export const offlineStore = writable({ forms: [], submissions: [], downloadedForms: [] });
export const isOnline = writable(true);

// Initialize auth store with enhanced persistent login
if (browser) {
	// Try to restore auth from localStorage for persistent login
	const savedAuth = localStorage.getItem('pb_auth');
	if (savedAuth) {
		try {
			const authData = JSON.parse(savedAuth);
			
			// Check if the saved auth is not too old (30 days max)
			const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
			if (authData.timestamp && authData.timestamp < thirtyDaysAgo) {
				console.log('Saved auth is too old, clearing it');
				localStorage.removeItem('pb_auth');
			} else {
				pb.authStore.save(authData.token, authData.model);
				console.log('Restored authentication from storage');
			}
		} catch (e) {
			console.warn('Failed to restore auth:', e);
			localStorage.removeItem('pb_auth');
		}
	}
	
	authStore.set({ user: pb.authStore.model });
	
	// Listen for auth changes and persist them with enhanced metadata
	pb.authStore.onChange((token, model) => {
		authStore.set({ user: model });
		if (token && model) {
			// Save auth for persistent login with timestamp
			const authData = {
				token,
				model,
				timestamp: Date.now(),
				loginTime: new Date().toISOString(),
				deviceInfo: {
					userAgent: navigator.userAgent,
					platform: navigator.platform,
					language: navigator.language
				}
			};
			localStorage.setItem('pb_auth', JSON.stringify(authData));
			console.log('Authentication saved to storage');
		} else {
			localStorage.removeItem('pb_auth');
			console.log('Authentication cleared from storage');
		}
	});

	// Monitor online/offline status
	const updateOnlineStatus = () => {
		const online = navigator.onLine;
		isOnline.set(online);
		console.log(`Network status: ${online ? 'Online' : 'Offline'}`);
		
		// Auto-sync when coming back online
		if (online && pb.authStore.model) {
			setTimeout(() => {
				syncOfflineSubmissions().then(result => {
					if (result.synced > 0) {
						console.log(`Auto-synced ${result.synced} submissions after coming online`);
					}
				});
			}, 2000); // Wait 2 seconds after coming online
		}
	};
	
	window.addEventListener('online', updateOnlineStatus);
	window.addEventListener('offline', updateOnlineStatus);
	updateOnlineStatus();
	
	// Load offline data on startup
	loadOfflineData();
	
	// Periodic sync attempt when online (every 5 minutes)
	setInterval(() => {
		if (navigator.onLine && pb.authStore.model) {
			syncOfflineSubmissions().catch(error => {
				console.log('Background sync failed:', error);
			});
		}
	}, 5 * 60 * 1000); // 5 minutes
}

// Login function
export async function login(email, password) {
	try {
		await pb.collection('users').authWithPassword(email, password);
		authStore.set({ user: pb.authStore.model });
		return { success: true };
	} catch (error) {
		console.error('Login failed:', error);
		return { success: false, error: error.message };
	}
}

// Logout function
export function logout() {
	pb.authStore.clear();
	clearOfflineStorage();
}

// Enhanced offline storage functions with cache validation
export function saveToOfflineStorage(key, data) {
	if (browser) {
		try {
			const dataWithTimestamp = {
				data: data,
				timestamp: Date.now(),
				version: '1.0'
			};
			localStorage.setItem(key, JSON.stringify(dataWithTimestamp));
		} catch (error) {
			console.error('Failed to save to offline storage:', error);
		}
	}
}

export function getFromOfflineStorage(key) {
	if (browser) {
		try {
			const stored = localStorage.getItem(key);
			if (!stored) return null;
			
			const parsed = JSON.parse(stored);
			
			// Handle legacy data format (without timestamp)
			if (!parsed.timestamp) {
				return parsed;
			}
			
			// Check if data is older than 7 days (optional cache expiration)
			const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
			if (parsed.timestamp < sevenDaysAgo) {
				console.log(`Cache for ${key} is older than 7 days, but keeping it for offline use`);
			}
			
			return parsed.data;
		} catch (error) {
			console.error('Failed to read from offline storage:', error);
			return null;
		}
	}
	return null;
}

// Clear all offline data (useful for logout or reset)
export function clearOfflineStorage() {
	if (browser) {
		const keysToRemove = ['offline_forms', 'offline_submissions', 'downloaded_forms', 'pb_auth'];
		keysToRemove.forEach(key => {
			localStorage.removeItem(key);
		});
		
		// Reset stores
		offlineStore.set({ forms: [], submissions: [], downloadedForms: [] });
		authStore.set({ user: null });
	}
}

// Get offline storage size (for debugging/monitoring)
export function getOfflineStorageSize() {
	if (!browser) return 0;
	
	let totalSize = 0;
	for (let key in localStorage) {
		if (localStorage.hasOwnProperty(key)) {
			totalSize += localStorage[key].length;
		}
	}
	return Math.round(totalSize / 1024); // Return size in KB
}

// Load offline data into store
export function loadOfflineData() {
	const forms = getFromOfflineStorage('offline_forms') || [];
	const submissions = getFromOfflineStorage('offline_submissions') || [];
	const downloadedForms = getFromOfflineStorage('downloaded_forms') || [];
	
	offlineStore.update(store => ({ 
		...store, 
		forms, 
		submissions, 
		downloadedForms 
	}));
}

// Download all forms for offline use (existing functionality)
export async function downloadForms() {
	try {
		const forms = await pb.collection('forms').getFullList({
			sort: '-created'
		});
		
		// For each form, get its questions
		const formsWithQuestions = await Promise.all(
			forms.map(async (form) => {
				try {
					const questions = await pb.collection('questions').getFullList({
						filter: `form = "${form.id}"`,
						sort: 'order'
					});
					return { ...form, questions };
				} catch (e) {
					console.warn(`Could not fetch questions for form ${form.id}:`, e);
					return { ...form, questions: [] };
				}
			})
		);
		
		// Save to offline storage
		saveToOfflineStorage('offline_forms', formsWithQuestions);
		
		// Mark all forms as downloaded
		const downloadedFormIds = formsWithQuestions.map(f => f.id);
		saveToOfflineStorage('downloaded_forms', downloadedFormIds);
		
		offlineStore.update(store => ({ 
			...store, 
			forms: formsWithQuestions,
			downloadedForms: downloadedFormIds
		}));
		
		return { success: true, forms: formsWithQuestions };
	} catch (error) {
		console.error('Error downloading forms:', error);
		return { success: false, error: error.message };
	}
}

// Download individual form for offline use
export async function downloadIndividualForm(formId) {
	try {
		// Get the form
		const form = await pb.collection('forms').getOne(formId);
		
		// Get its questions
		const questions = await pb.collection('questions').getFullList({
			filter: `form = "${formId}"`,
			sort: 'order'
		});
		
		const formWithQuestions = { ...form, questions };
		
		// Get existing offline forms
		const existingForms = getFromOfflineStorage('offline_forms') || [];
		const existingDownloaded = getFromOfflineStorage('downloaded_forms') || [];
		
		// Update or add this form
		const formIndex = existingForms.findIndex(f => f.id === formId);
		if (formIndex >= 0) {
			existingForms[formIndex] = formWithQuestions;
		} else {
			existingForms.push(formWithQuestions);
		}
		
		// Add to downloaded list if not already there
		if (!existingDownloaded.includes(formId)) {
			existingDownloaded.push(formId);
		}
		
		// Save to offline storage
		saveToOfflineStorage('offline_forms', existingForms);
		saveToOfflineStorage('downloaded_forms', existingDownloaded);
		
		// Update store
		offlineStore.update(store => ({ 
			...store, 
			forms: existingForms,
			downloadedForms: existingDownloaded
		}));
		
		return { success: true, form: formWithQuestions };
	} catch (error) {
		console.error('Error downloading individual form:', error);
		return { success: false, error: error.message };
	}
}

// Remove individual form from offline storage
export function removeIndividualForm(formId) {
	const existingForms = getFromOfflineStorage('offline_forms') || [];
	const existingDownloaded = getFromOfflineStorage('downloaded_forms') || [];
	
	// Remove from forms list
	const updatedForms = existingForms.filter(f => f.id !== formId);
	
	// Remove from downloaded list
	const updatedDownloaded = existingDownloaded.filter(id => id !== formId);
	
	// Save to offline storage
	saveToOfflineStorage('offline_forms', updatedForms);
	saveToOfflineStorage('downloaded_forms', updatedDownloaded);
	
	// Update store
	offlineStore.update(store => ({ 
		...store, 
		forms: updatedForms,
		downloadedForms: updatedDownloaded
	}));
	
	return { success: true };
}

// Check if a form is downloaded
export function isFormDownloaded(formId) {
	const downloadedForms = getFromOfflineStorage('downloaded_forms') || [];
	return downloadedForms.includes(formId);
}

// Get offline forms
export function getOfflineForms() {
	const forms = getFromOfflineStorage('offline_forms') || [];
	const downloadedForms = getFromOfflineStorage('downloaded_forms') || [];
	
	offlineStore.update(store => ({ 
		...store, 
		forms, 
		downloadedForms 
	}));
	return forms;
}

// Save submission offline with enhanced metadata
export function saveSubmissionOffline(formId, answers) {
	const submissions = getFromOfflineStorage('offline_submissions') || [];
	const newSubmission = {
		id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Unique offline ID
		formId,
		answers,
		timestamp: new Date().toISOString(),
		synced: false,
		deviceInfo: {
			userAgent: browser ? navigator.userAgent : 'Unknown',
			platform: browser ? navigator.platform : 'Unknown',
			language: browser ? navigator.language : 'en'
		},
		retryCount: 0,
		lastSyncAttempt: null
	};
	
	submissions.push(newSubmission);
	saveToOfflineStorage('offline_submissions', submissions);
	offlineStore.update(store => ({ ...store, submissions }));
	
	return newSubmission;
}

// Sync offline submissions when online with enhanced error handling
export async function syncOfflineSubmissions() {
	const submissions = getFromOfflineStorage('offline_submissions') || [];
	const unsyncedSubmissions = submissions.filter(s => !s.synced);
	
	if (unsyncedSubmissions.length === 0) {
		return { success: true, synced: 0 };
	}
	
	let syncedCount = 0;
	let failedCount = 0;
	const updatedSubmissions = [...submissions];
	
	for (const submission of unsyncedSubmissions) {
		try {
			// Update retry count and last attempt
			const submissionIndex = updatedSubmissions.findIndex(s => s.id === submission.id);
			if (submissionIndex !== -1) {
				updatedSubmissions[submissionIndex].retryCount = (submission.retryCount || 0) + 1;
				updatedSubmissions[submissionIndex].lastSyncAttempt = new Date().toISOString();
			}
			
			// Create submission record
			const submissionRecord = await pb.collection('submissions').create({
				form: submission.formId,
				submittedBy: pb.authStore.model?.id,
				location: 'Mobile App'
			});
			
			// Create answer records
			for (const [questionId, answerValue] of Object.entries(submission.answers)) {
				if (answerValue !== null && answerValue !== undefined && answerValue !== '') {
					await pb.collection('answers').create({
						submission: submissionRecord.id,
						question: questionId,
						answerValue: answerValue.toString()
					});
				}
			}
			
			// Mark as synced
			if (submissionIndex !== -1) {
				updatedSubmissions[submissionIndex].synced = true;
				updatedSubmissions[submissionIndex].serverSubmissionId = submissionRecord.id;
			}
			syncedCount++;
			
		} catch (error) {
			console.error(`Failed to sync submission ${submission.id}:`, error);
			failedCount++;
			
			// If retry count exceeds 5, mark as failed permanently
			const submissionIndex = updatedSubmissions.findIndex(s => s.id === submission.id);
			if (submissionIndex !== -1 && (submission.retryCount || 0) >= 5) {
				updatedSubmissions[submissionIndex].syncFailed = true;
				updatedSubmissions[submissionIndex].lastError = error.message;
			}
		}
	}
	
	// Update offline storage
	saveToOfflineStorage('offline_submissions', updatedSubmissions);
	offlineStore.update(store => ({ ...store, submissions: updatedSubmissions }));
	
	return { 
		success: syncedCount > 0 || failedCount === 0, 
		synced: syncedCount, 
		failed: failedCount,
		total: unsyncedSubmissions.length
	};
}


// Session management utilities
export function getSessionInfo() {
	if (!browser) return null;
	
	const savedAuth = localStorage.getItem('pb_auth');
	if (!savedAuth) return null;
	
	try {
		const authData = JSON.parse(savedAuth);
		return {
			loginTime: authData.loginTime,
			deviceInfo: authData.deviceInfo,
			isExpired: authData.timestamp && (Date.now() - authData.timestamp) > (30 * 24 * 60 * 60 * 1000)
		};
	} catch (e) {
		return null;
	}
}

// Check if user is authenticated (works offline)
export function isAuthenticated() {
	return !!pb.authStore.model;
}

// Refresh authentication token (when online)
export async function refreshAuth() {
	if (!navigator.onLine) {
		return { success: false, error: 'Cannot refresh auth while offline' };
	}
	
	try {
		await pb.collection('users').authRefresh();
		return { success: true };
	} catch (error) {
		console.error('Auth refresh failed:', error);
		// If refresh fails, clear the stored auth
		pb.authStore.clear();
		return { success: false, error: error.message };
	}
}

// Auto-refresh auth token periodically (when online)
if (browser) {
	setInterval(async () => {
		if (navigator.onLine && pb.authStore.model) {
			const sessionInfo = getSessionInfo();
			if (sessionInfo && !sessionInfo.isExpired) {
				await refreshAuth();
			}
		}
	}, 60 * 60 * 1000); // Every hour
}

