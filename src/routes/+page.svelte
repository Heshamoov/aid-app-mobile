<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, isOnline, login } from '$lib/api.js';
	
	let email = '';
	let password = '';
	let isLoading = false;
	let error = '';
	let user = null;
	let online = true;
	
	// Subscribe to stores
	authStore.subscribe(value => {
		user = value.user;
		if (user) {
			goto('/forms');
		}
	});
	
	isOnline.subscribe(value => {
		online = value;
	});
	
	async function handleLogin() {
		if (!email || !password) {
			error = 'Please enter both email and password';
			return;
		}
		
		if (!online) {
			error = 'You need to be online to login';
			return;
		}
		
		isLoading = true;
		error = '';
		
		const result = await login(email, password);
		
		if (result.success) {
			// Navigation will happen automatically via store subscription
		} else {
			error = result.error || 'Login failed';
		}
		
		isLoading = false;
	}
	
	function handleKeyPress(event) {
		if (event.key === 'Enter') {
			handleLogin();
		}
	}
</script>

<svelte:head>
	<title>Login - Aid Platform Mobile</title>
</svelte:head>

<!-- Online/Offline Status Bar -->
<div class="status-bar" class:online>
	{online ? '🟢 Online' : '🔴 Offline'}
</div>

<div class="container" style="margin-top: 3rem;">
	<div class="card" style="max-width: 400px; margin: 2rem auto;">
		<div class="text-center mb-6">
			<h1 class="text-2xl font-bold mb-4">Aid Platform</h1>
			<p class="text-gray-600">Volunteer Mobile App</p>
		</div>
		
		<form on:submit|preventDefault={handleLogin}>
			<div class="form-group">
				<label for="email" class="form-label">Email</label>
				<input
					id="email"
					type="email"
					class="input"
					bind:value={email}
					on:keypress={handleKeyPress}
					placeholder="Enter your email"
					disabled={isLoading}
					required
				/>
			</div>
			
			<div class="form-group">
				<label for="password" class="form-label">Password</label>
				<input
					id="password"
					type="password"
					class="input"
					bind:value={password}
					on:keypress={handleKeyPress}
					placeholder="Enter your password"
					disabled={isLoading}
					required
				/>
			</div>
			
			{#if error}
				<div class="text-red-600 text-center mb-4">
					{error}
				</div>
			{/if}
			
			<button
				type="submit"
				class="btn"
				disabled={isLoading || !online}
			>
				{isLoading ? 'Logging in...' : 'Login'}
			</button>
		</form>
		
		{#if !online}
			<div class="text-center mt-4 text-gray-600">
				<p>You need an internet connection to login.</p>
				<p>Once logged in, you can use the app offline.</p>
			</div>
		{/if}
	</div>
</div>

