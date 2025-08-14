<script>
	import { onMount } from 'svelte';
	import { authStore, isOnline, getOfflineForms } from '$lib/api.js';
	
	onMount(() => {
		// Load offline forms on app start
		getOfflineForms();
	});
</script>

<main class="min-h-screen bg-gray-50">
	<slot />
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}
	
	:global(*) {
		box-sizing: border-box;
	}
	
	/* Mobile-first responsive design */
	:global(.container) {
		max-width: 100%;
		margin: 0 auto;
		padding: 1rem;
	}
	
	:global(.btn) {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background-color: #4f46e5;
		color: white;
		text-decoration: none;
		border-radius: 0.5rem;
		border: none;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.2s;
		width: 100%;
		text-align: center;
	}
	
	:global(.btn:hover) {
		background-color: #4338ca;
	}
	
	:global(.btn:disabled) {
		background-color: #9ca3af;
		cursor: not-allowed;
	}
	
	:global(.btn-secondary) {
		background-color: #6b7280;
	}
	
	:global(.btn-secondary:hover) {
		background-color: #4b5563;
	}
	
	:global(.input) {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 1rem;
		margin-bottom: 1rem;
	}
	
	:global(.input:focus) {
		outline: none;
		border-color: #4f46e5;
		box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
	}
	
	:global(.card) {
		background: white;
		border-radius: 0.75rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 1rem;
	}
	
	:global(.status-bar) {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		background: #ef4444;
		color: white;
		text-align: center;
		padding: 0.5rem;
		font-size: 0.875rem;
		z-index: 1000;
	}
	
	:global(.status-bar.online) {
		background: #10b981;
	}
	
	:global(.form-group) {
		margin-bottom: 1rem;
	}
	
	:global(.form-label) {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #374151;
	}
	
	:global(.text-center) {
		text-align: center;
	}
	
	:global(.text-lg) {
		font-size: 1.125rem;
	}
	
	:global(.text-xl) {
		font-size: 1.25rem;
	}
	
	:global(.text-2xl) {
		font-size: 1.5rem;
	}
	
	:global(.font-bold) {
		font-weight: 700;
	}
	
	:global(.mb-4) {
		margin-bottom: 1rem;
	}
	
	:global(.mb-6) {
		margin-bottom: 1.5rem;
	}
	
	:global(.mt-4) {
		margin-top: 1rem;
	}
	
	:global(.text-gray-600) {
		color: #4b5563;
	}
	
	:global(.text-red-600) {
		color: #dc2626;
	}
	
	:global(.text-green-600) {
		color: #059669;
	}
</style>

