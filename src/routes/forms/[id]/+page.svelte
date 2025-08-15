<script>
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import {
		authStore,
		offlineStore,
		saveSubmissionOffline,
		isFormDownloaded,
	} from "$lib/api.js";

	let user = null;
	let form = null;
	let questions = [];
	let answers = {};
	let isSubmitting = false;
	let submitMessage = "";
	let error = "";
	let formId = "";
	let isFormAvailable = false;

	// Subscribe to stores
	authStore.subscribe((value) => {
		user = value.user;
		if (!user) {
			goto("/");
		}
	});

	offlineStore.subscribe((value) => {
		const forms = value.forms || [];
		formId = $page.params.id;
		form = forms.find((f) => f.id === formId);
		questions = form?.questions || [];
		isFormAvailable = !!form;

		if (!isFormAvailable && formId) {
			error =
				"This form is not available offline. Please download it first when you have internet connection.";
		} else {
			error = "";
		}

		// Initialize answers object
		questions.forEach((question) => {
			if (!(question.id in answers)) {
				answers[question.id] = "";
			}
		});
	});

	onMount(() => {
		const formId = $page.params.id;
		if (!formId) {
			error = "Form ID not found";
			return;
		}
	});

	async function handleSubmit() {
		// Validate required fields
		const unansweredRequired = questions.filter(
			(q) =>
				q.required &&
				(!answers[q.id] || answers[q.id].toString().trim() === ""),
		);

		if (unansweredRequired.length > 0) {
			error = `Please answer all required questions: ${unansweredRequired.map((q) => q.questionText).join(", ")}`;
			return;
		}

		isSubmitting = true;
		error = "";
		submitMessage = "";

		try {
			// Save submission offline
			const submission = saveSubmissionOffline(form.id, answers);

			submitMessage =
				"Form submitted successfully! Data saved locally and will sync when online.";

			// Clear form after successful submission
			setTimeout(() => {
				goto("/forms");
			}, 2000);
		} catch (e) {
			error = "Failed to save submission: " + e.message;
		}

		isSubmitting = false;
	}

	function goBack() {
		goto("/forms");
	}

	function renderQuestion(question) {
		switch (question.type) {
			case "text":
			case "email":
			case "number":
				return "input";
			case "textarea":
				return "textarea";
			case "select":
			case "radio":
				return "select";
			case "checkbox":
				return "checkbox";
			default:
				return "input";
		}
	}

	function getInputType(questionType) {
		switch (questionType) {
			case "email":
				return "email";
			case "number":
				return "number";
			default:
				return "text";
		}
	}
</script>

<svelte:head>
	<title>{form?.formName || "Form"} - Aid Platform Mobile</title>
</svelte:head>

<div class="container">
	{#if error && !isFormAvailable}
		<div class="card">
			<h2 class="text-lg font-bold mb-4">
				📱 Form Not Available Offline
			</h2>
			<p class="text-red-600 mb-4">{error}</p>
			<div
				style="background: #fef3c7; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;"
			>
				<p class="text-yellow-800">
					<strong>💡 To use this form offline:</strong><br />
					1. Connect to the internet<br />
					2. Go back to the forms list<br />
					3. Click the "📥 Download" button next to this form<br />
					4. You can then fill it out without internet
				</p>
			</div>
			<button class="btn" on:click={goBack}>← Back to Forms</button>
		</div>
	{:else if form}
		<!-- Header -->
		<div class="card">
			<div
				style="display: flex; justify-content: space-between; align-items: center;"
			>
				<div>
					<h1 class="text-xl font-bold">{form.formName}</h1>
					<p class="text-gray-600">{questions.length} questions</p>
				</div>
				<button
					class="btn-secondary"
					style="width: auto; padding: 0.5rem 1rem;"
					on:click={goBack}
				>
					← Back
				</button>
			</div>
		</div>

		<!-- Success Message -->
		{#if submitMessage}
			<div
				class="card"
				style="background: #d1fae5; border-left: 4px solid #10b981;"
			>
				<p class="text-green-600 font-bold">✅ {submitMessage}</p>
			</div>
		{/if}

		<!-- Error Message -->
		{#if error}
			<div
				class="card"
				style="background: #fee2e2; border-left: 4px solid #ef4444;"
			>
				<p class="text-red-600 font-bold">❌ {error}</p>
			</div>
		{/if}

		<!-- Form -->
		<form on:submit|preventDefault={handleSubmit}>
			{#each questions as question, index (question.id)}
				<div class="card">
					<div class="form-group">
						<label for="q_{question.id}" class="form-label">
							{index + 1}. {question.questionText}
							{#if question.required}
								<span style="color: #ef4444;">*</span>
							{/if}
						</label>

						{#if renderQuestion(question) === "input"}
							{#if question.type === "Text"}
								<input
									id="q_{question.id}"
									class="input"
									type="text"
									bind:value={answers[question.id]}
								/>
							{:else if question.type === "Number"}
								<input
									id="q_{question.id}"
									class="input"
									type="number"
									bind:value={answers[question.id]}
								/>
							{:else if question.type === "Date"}
								<input
									id="q_{question.id}"
									class="input"
									type="date"
									bind:value={answers[question.id]}
								/>
							{:else if question.type === "Checkbox"}
								<input
									id="q_{question.id}"
									class="input"
									type="checkbox"
									bind:checked={answers[question.id]}
								/>
							{:else}
								<input
									id="q_{question.id}"
									class="input"
									type="text"
									bind:value={answers[question.id]}
								/>
							{/if}
						{:else if renderQuestion(question) === "textarea"}
							<textarea
								id="q_{question.id}"
								class="input"
								bind:value={answers[question.id]}
								placeholder="Enter your answer"
								required={question.required}
								disabled={isSubmitting}
								rows="4"
							></textarea>
						{:else if renderQuestion(question) === "select"}
							<select
								id="q_{question.id}"
								class="input"
								bind:value={answers[question.id]}
								required={question.required}
								disabled={isSubmitting}
							>
								<option value="">Select an option</option>
								{#if question.options}
									{#each question.options as option}
										<option value={option}>{option}</option>
									{/each}
								{/if}
							</select>
						{:else if renderQuestion(question) === "checkbox"}
							<div
								style="display: flex; align-items: center; gap: 0.5rem;"
							>
								<input
									id="q_{question.id}"
									type="checkbox"
									bind:checked={answers[question.id]}
									required={question.required}
									disabled={isSubmitting}
								/>
								<label for="q_{question.id}">Yes</label>
							</div>
						{/if}
					</div>
				</div>
			{/each}

			<!-- Submit Button -->
			<div class="card">
				<button
					type="submit"
					class="btn"
					disabled={isSubmitting || questions.length === 0}
				>
					{isSubmitting ? "Submitting..." : "📤 Submit Form"}
				</button>

				<p class="text-gray-600 text-center mt-4">
					💾 Your data will be saved locally and synced when you're
					online
				</p>
			</div>
		</form>
	{:else}
		<div class="card">
			<p class="text-gray-600">Loading form...</p>
		</div>
	{/if}
</div>
