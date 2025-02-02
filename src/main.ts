// This file contains the main FormBuilder class that manages the app's logic

import type { Form, FormField, FieldType, FormResponse } from "./types"
import { StorageManager } from "./storage"
import { Renderer } from "./renderer"

// FormBuilder, which is a Main Class that handles form creation, adding fields, edition and submission
class FormBuilder {
  private forms: Form[] = []
  private currentForm: Form | null = null
  private editingFieldId: string | null = null

  constructor() {
    this.init()
  }

  // init function that initialises the app
  private init(): void {
    this.forms = StorageManager.getForms()
    this.setupEventListeners()
    this.renderFormList()
  }

  // handles event listeners for user interactions
  private setupEventListeners(): void {
    document.getElementById("app")?.addEventListener("click", (e) => this.handleAppClick(e))
    document.getElementById("formModalForm")?.addEventListener("submit", (e) => this.handleFormModalSubmit(e))
    document.getElementById("fieldModalForm")?.addEventListener("submit", (e) => this.handleFieldModalSubmit(e))
    document.querySelectorAll(".modal .cancel").forEach((button) => {
      button.addEventListener("click", () => this.closeModals())
    })
    document.getElementById("fieldType")?.addEventListener("change", () => this.updateOptionsVisibility())
  }

  private handleAppClick(e: Event): void {
    const target = e.target as HTMLElement
    if (target.id === "createFormBtn") {
      this.createNewForm()
    } else if (target.classList.contains("view-responses")) {
      this.viewResponses(target.dataset.id!)
    }
  }

  // modal for creating a form
  private showFormModal(form?: Form): void {
    const titleEl = document.getElementById("formModalTitle") as HTMLElement
    const nameInput = document.getElementById("formName") as HTMLInputElement

    titleEl.textContent = form ? "Edit Form" : "Create New Form"
    nameInput.value = form ? form.name : ""
    Renderer.showModal("formModal")
  }

  // modal for adding / editing a field
  private showFieldModal(field?: FormField): void {
    const titleEl = document.getElementById("fieldModalTitle") as HTMLElement
    const typeSelect = document.getElementById("fieldType") as HTMLSelectElement
    const labelInput = document.getElementById("fieldLabel") as HTMLInputElement
    const requiredCheckbox = document.getElementById("fieldRequired") as HTMLInputElement
    const optionsInput = document.getElementById("fieldOptions") as HTMLInputElement

    titleEl.textContent = field ? "Edit Field" : "Add New Field"
    typeSelect.value = field ? field.type : "text"
    labelInput.value = field ? field.label : ""
    requiredCheckbox.checked = field ? field.required : false
    optionsInput.value = field && field.options ? field.options.join(", ") : ""

    this.updateOptionsVisibility()
    Renderer.showModal("fieldModal")
  }

  private closeModals(): void {
    Renderer.closeModal("formModal")
    Renderer.closeModal("fieldModal")
    this.editingFieldId = null
  }

  private updateOptionsVisibility(): void {
    const typeSelect = document.getElementById("fieldType") as HTMLSelectElement
    const optionsContainer = document.getElementById("optionsContainer") as HTMLElement
    optionsContainer.style.display = ["radio", "checkbox", "select"].includes(typeSelect.value) ? "block" : "none"
  }

  // Handle form submission for creaing a form
  private handleFormModalSubmit(e: Event): void {
    e.preventDefault()
    const nameInput = document.getElementById("formName") as HTMLInputElement
    const formName = nameInput.value.trim()

    if (formName) {
      const newForm: Form = {
        id: Date.now().toString(),
        name: formName,
        fields: [],
      }
      this.forms.push(newForm)
      this.currentForm = newForm
      StorageManager.saveForms(this.forms)
      this.closeModals()
      this.renderFormBuilder()
    }
  }

  // Handle form submission for adding/editing a field
  private handleFieldModalSubmit(e: Event): void {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const field: FormField = {
      id: this.editingFieldId || Date.now().toString(),
      type: formData.get("fieldType") as FieldType,
      label: formData.get("fieldLabel") as string,
      required: formData.get("fieldRequired") === "on",
      options: ["radio", "checkbox", "select"].includes(formData.get("fieldType") as string)
        ? (formData.get("fieldOptions") as string).split(",").map((opt) => opt.trim())
        : undefined,
    }

    if (this.currentForm) {
      if (this.editingFieldId) {
        const index = this.currentForm.fields.findIndex((f) => f.id === this.editingFieldId)
        if (index !== -1) {
          this.currentForm.fields[index] = field
        }
      } else {
        this.currentForm.fields.push(field)
      }
      this.renderFormBuilder()
    }

    this.closeModals()
  }

  // render the list of all forms
  private renderFormList(): void {
    Renderer.renderFormList(
      this.forms,
      (id) => this.editForm(id),
      (id) => this.deleteForm(id),
      (id) => this.previewForm(id),
      (id) => this.viewResponses(id),
    )
  }

  // render the form builder for the current form
  private renderFormBuilder(): void {
    if (!this.currentForm) return
    Renderer.renderFormBuilder(
      this.currentForm,
      () => this.showFieldModal(),
      (id) => this.editField(id),
      (id) => this.deleteField(id),
      (id, direction) => this.moveField(id, direction),
      () => this.saveForm(),
      () => this.renderFormList(),
    )
  }

  private editForm(id: string): void {
    this.currentForm = this.forms.find((form) => form.id === id) || null
    this.renderFormBuilder()
  }

  private deleteForm(id: string): void {
    this.forms = this.forms.filter((form) => form.id !== id)
    StorageManager.deleteForm(id)
    this.renderFormList()
  }

  // handle preview form
  private previewForm(id: string): void {
    const form = this.forms.find((form) => form.id === id)
    if (form) {
      const lastResponse = StorageManager.getLastResponse(form.id)
      Renderer.renderFormPreview(
        form,
        (formData) => this.handleFormSubmit(formData),
        () => this.renderFormList(),
        lastResponse,
      )
    }
  }

  private editField(id: string): void {
    if (this.currentForm) {
      const field = this.currentForm.fields.find((f) => f.id === id)
      if (field) {
        this.editingFieldId = id
        this.showFieldModal(field)
      }
    }
  }

  private deleteField(id: string): void {
    if (this.currentForm) {
      this.currentForm.fields = this.currentForm.fields.filter((field) => field.id !== id)
      this.renderFormBuilder()
    }
  }

  private moveField(id: string, direction: "up" | "down"): void {
    if (this.currentForm) {
      const index = this.currentForm.fields.findIndex((field) => field.id === id)
      if (index !== -1) {
        if (direction === "up" && index > 0) {
          ;[this.currentForm.fields[index - 1], this.currentForm.fields[index]] = [
            this.currentForm.fields[index],
            this.currentForm.fields[index - 1],
          ]
        } else if (direction === "down" && index < this.currentForm.fields.length - 1) {
          ;[this.currentForm.fields[index], this.currentForm.fields[index + 1]] = [
            this.currentForm.fields[index + 1],
            this.currentForm.fields[index],
          ]
        }
        this.renderFormBuilder()
      }
    }
  }

  // Handle form submission from the preview
  private handleFormSubmit(formData: FormData): void {
    if (!this.currentForm) return

    const response: FormResponse = {
      id: Date.now().toString(),
      formId: this.currentForm.id,
      data: {},
    }

    this.currentForm.fields.forEach((field) => {
      if (field.type === "checkbox") {
        response.data[field.id] = formData.getAll(field.id) as string[]
      } else {
        response.data[field.id] = formData.get(field.id) as string
      }
    })

    StorageManager.saveResponse(response)
    console.log("Form submitted:", response)
    Renderer.showMessage("Form submitted successfully!")
    this.previewForm(this.currentForm.id) // Refresh the preview
  }

  // display responses for a specific form
  private viewResponses(formId: string): void {
    const form = this.forms.find((f) => f.id === formId)
    if (!form) return

    const responses = StorageManager.getResponses(formId)
    Renderer.renderResponsesList(form, responses, () => this.renderFormList())
  }

  // save the current form
  private saveForm(): void {
    if (this.currentForm) {
      const index = this.forms.findIndex((form) => form.id === this.currentForm!.id)
      if (index !== -1) {
        this.forms[index] = this.currentForm
      } else {
        this.forms.push(this.currentForm)
      }
      StorageManager.saveForms(this.forms)
      Renderer.showMessage("Form saved successfully!")
      this.renderFormList()
    }
  }

  private createNewForm(): void {
    this.currentForm = null
    this.showFormModal()
  }
}

// Initialize the application
new FormBuilder()
