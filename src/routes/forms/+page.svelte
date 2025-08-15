<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, isOnline, offlineStore, downloadForms, downloadIndividualForm, removeIndividualForm, isFormDownloaded, logout, syncOfflineSubmissions } from '$lib/api.js';
	
	let user = null;
	let online = true;
	let forms = [];
	let submissions = [];
	let downloadedForms = [];
	let isDownloading = false;
	let isSyncing = false;
	let downloadError = '';
	let syncMessage = '';
	let downloadingFormId = null;
	
	// Subscribe to stores
	authStore.subscribe(value => {
		user = value.user;
		if (!user) {
			goto('/');
		}
	});
	
	isOnline.subscribe(value => {
		online = value;
	});
	
	offlineStore.subscribe(value => {
		forms = value.forms || [];
		submissions = value.submissions || [];
		downloadedForms = value.downloadedForms || [];
	});
	
	onMount(() => {
		// If online, try to download latest forms
		if (online) {
			handleDownloadForms();
		}
	});
	
	async function handleDownloadForms() {
		isDownloading = true;
		downloadError = '';
		
		const result = await downloadForms();
		
		if (result.success) {
			forms = result.forms;
		} else {
			downloadError = result.error || 'Failed to download forms';
		}
		
		isDownloading = false;
	}
	
	async function handleDownloadIndividualForm(formId) {
		downloadingFormId = formId;
		
		const result = await downloadIndividualForm(formId);
		
		if (!result.success) {
			downloadError = result.error || 'Failed to download form';
			setTimeout(() => {
				downloadError = '';
			}, 3000);
		}
		
		downloadingFormId = null;
	}
	
	function handleRemoveForm(formId) {
		removeIndividualForm(formId);
	}
	
	async function handleSync() {
		if (!online) {
			syncMessage = 'You need to be online to sync';
			return;
		}
		
		isSyncing = true;
		syncMessage = '';
		
		const result = await syncOfflineSubmissions();
		
		if (result.success) {
			if (result.synced > 0) {
				syncMessage = `✅ Successfully synced ${result.synced} submission${result.synced > 1 ? 's' : ''}`;
				if (result.failed > 0) {
					syncMessage += ` (${result.failed} failed)`;
				}
			} else {
				syncMessage = '✅ All submissions are already synced';
			}
		} else {
			syncMessage = `❌ Sync failed: ${result.failed || 0} submissions could not be synced`;
		}
		
		isSyncing = false;
		
		// Clear message after 5 seconds
		setTimeout(() => {
			syncMessage = '';
		}, 5000);
	}
	
	function handleLogout() {
		logout();
	}
	
	function openForm(formId) {
		goto(`/forms/${formId}`);
	}
	
	// Get unsynced submissions count
	$: unsyncedCount = submissions.filter(s => !s.synced).length;
</script>

<svelte:head>
	<title>Forms - Aid Platform Mobile</title>
</svelte:head>

<!-- Online/Offline Status Bar -->
<div class="status-bar" class:online>
	{online ? '🟢 Online' : '🔴 Offline'}
</div>

<div class="container" style="margin-top: 3rem;">
	<!-- Header -->
	<div class="card">
		<div style="display: flex; justify-content: space-between; align-items: center;">
			<div>
				<h1 class="text-xl font-bold">Welcome, {user?.email || 'Volunteer'}</h1>
				<p class="text-gray-600">Available Forms</p>
			</div>
			<button class="btn-secondary" style="width: auto; padding: 0.5rem 1rem;" on:click={handleLogout}>
				Logout
			</button>
		</div>
	</div>
	
	<!-- Sync Status -->
	{#if unsyncedCount > 0}
		<div class="card" style="background: #fef3c7; border-left: 4px solid #f59e0b;">
			<div style="display: flex; justify-content: space-between; align-items: center;">
				<div>
					<p class="font-bold">📤 {unsyncedCount} submission{unsyncedCount > 1 ? 's' : ''} pending sync</p>
					<p class="text-gray-600">Connect to internet to sync your data</p>
				</div>
				{#if online}
					<button 
						class="btn" 
						style="width: auto; padding: 0.5rem 1rem;"
						on:click={handleSync}
						disabled={isSyncing}
					>
						{isSyncing ? 'Syncing...' : 'Sync Now'}
					</button>
				{/if}
			</div>
		</div>
	{/if}
	
	<!-- Sync Message -->
	{#if syncMessage}
		<div class="card" style="background: #d1fae5; border-left: 4px solid #10b981;">
			<p class="text-green-600">{syncMessage}</p>
		</div>
	{/if}
	
	<!-- Download Forms Button -->
	{#if online}
		<div class="card">
			<button 
				class="btn" 
				on:click={handleDownloadForms}
				disabled={isDownloading}
			>
				{isDownloading ? 'Downloading Forms...' : '📥 Download Latest Forms'}
			</button>
			
			{#if downloadError}
				<p class="text-red-600 mt-4">{downloadError}</p>
			{/if}
		</div>
	{/if}
	
	<!-- Forms List -->
	{#if forms.length === 0}
		<div class="card text-center">
			<p class="text-gray-600">No forms available</p>
			{#if online}
				<p class="text-gray-600">Try downloading forms from the server</p>
			{:else}
				<p class="text-gray-600">Connect to internet to download forms</p>
			{/if}
		</div>
	{:else}
		<div class="mb-4">
			<h2 class="text-lg font-bold mb-4">📋 Available Forms ({forms.length})</h2>
			
			{#each forms as form (form.id)}
				<div class="card">
					<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
						<button type="button" class="w-full text-left" on:click={() => openForm(form.id)}>
							<h3 class="font-bold">{form.formName}</h3>
							<p class="text-gray-600">{form.questions?.length || 0} questions</p>
							{#if downloadedForms.includes(form.id)}
								<p class="text-green-600 text-sm">✅ Downloaded for offline use</p>
							{:else}
								<p class="text-gray-500 text-sm">⚠️ Not downloaded - requires internet</p>
							{/if}
						</button>
						<div style="font-size: 1.5rem; margin-left: 1rem;">▶️</div>
					</div>
					
					{#if online}
						<div style="display: flex; gap: 0.5rem;">
							{#if downloadedForms.includes(form.id)}
								<button 
									class="btn-secondary" 
									style="width: auto; padding: 0.5rem 1rem; font-size: 0.875rem;"
									on:click|stopPropagation={() => handleRemoveForm(form.id)}
								>
									🗑️ Remove
								</button>
								<button 
									class="btn" 
									style="width: auto; padding: 0.5rem 1rem; font-size: 0.875rem;"
									on:click|stopPropagation={() => handleDownloadIndividualForm(form.id)}
									disabled={downloadingFormId === form.id}
								>
									{downloadingFormId === form.id ? 'Updating...' : '🔄 Update'}
								</button>
							{:else}
								<button 
									class="btn" 
									style="width: auto; padding: 0.5rem 1rem; font-size: 0.875rem;"
									on:click|stopPropagation={() => handleDownloadIndividualForm(form.id)}
									disabled={downloadingFormId === form.id}
								>
									{downloadingFormId === form.id ? 'Downloading...' : '📥 Download'}
								</button>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
	
	<!-- Offline Notice -->
	{#if !online}
		<div class="card" style="background: #fee2e2; border-left: 4px solid #ef4444;">
			<p class="text-red-600 font-bold">🔴 You are offline</p>
			<p class="text-gray-600">You can still fill out forms. Your data will be saved locally and synced when you're back online.</p>
		</div>
	{/if}
</div>

