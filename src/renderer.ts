import type { Form, FormField } from "./types"

export class Renderer {
  static renderFormList(
    forms: Form[],
    onEdit: (id: string) => void,
    onDelete: (id: string) => void,
    onPreview: (id: string) => void
  ): void {
    const appContainer = document.getElementById("app")
    if (!appContainer) return

    let html = "<h2>Your Forms</h2>"
    html += '<button id="createFormBtn">Create New Form</button>'

    if (forms.length === 0) {
      html += "<p>No forms created yet.</p>"
    } else {
      html += "<ul>"
      forms.forEach((form) => {
        html += `
                    <li>
                        ${form.name}
                        <button class="edit-form" data-id="${form.id}">Edit</button>
                        <button class="delete-form" data-id="${form.id}">Delete</button>
                        <button class="preview-form" data-id="${form.id}">Preview</button>
                        <button class="view-responses" data-id="${form.id}">View Responses</button>
                    </li>
                `
      })
      html += "</ul>"
    }

    appContainer.innerHTML = html

    document.querySelectorAll(".edit-form").forEach((btn) => {
      btn.addEventListener("click", (e) => onEdit((e.target as HTMLElement).dataset.id!))
    })
    document.querySelectorAll(".delete-form").forEach((btn) => {
      btn.addEventListener("click", (e) => onDelete((e.target as HTMLElement).dataset.id!))
    })
    document.querySelectorAll(".preview-form").forEach((btn) => {
      btn.addEventListener("click", (e) => onPreview((e.target as HTMLElement).dataset.id!))
    })
  }

  static renderFormBuilder(
    form: Form,
    onFieldAdd: () => void,
    onFieldEdit: (id: string) => void,
    onFieldDelete: (id: string) => void,
    onFieldMove: (id: string, direction: "up" | "down") => void,
    onSave: () => void,
    onBack: () => void,
  ): void {
    const appContainer = document.getElementById("app")
    if (!appContainer) return

    let html = `
            <h2>${form.name}</h2>
            <button id="backToList">Back to Form List</button>
            <div id="formFields">
        `

    form.fields.forEach((field, index) => {
      html += this.renderFieldEditor(field, index, form.fields.length)
    })

    html += `
            </div>
            <button id="addFieldBtn">Add Field</button>
            <button id="saveFormBtn">Save Form</button>
        `

    appContainer.innerHTML = html

    document.getElementById("backToList")?.addEventListener("click", onBack)
    document.getElementById("addFieldBtn")?.addEventListener("click", onFieldAdd)
    document.getElementById("saveFormBtn")?.addEventListener("click", onSave)

    document.querySelectorAll(".edit-field").forEach((btn) => {
      btn.addEventListener("click", (e) => onFieldEdit((e.target as HTMLElement).dataset.id!))
    })
    document.querySelectorAll(".delete-field").forEach((btn) => {
      btn.addEventListener("click", (e) => onFieldDelete((e.target as HTMLElement).dataset.id!))
    })
    document.querySelectorAll(".move-field-up, .move-field-down").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.target as HTMLElement
        onFieldMove(target.dataset.id!, target.classList.contains("move-field-up") ? "up" : "down")
      })
    })
  }

  private static renderFieldEditor(field: FormField, index: number, totalFields: number): string {
    let html = `<div class="field-editor">`
    html += `<h3>${field.label} (${field.type})</h3>`
    if (field.options) {
      html += "<ul>"
      field.options.forEach((option) => {
        html += `<li>${option}</li>`
      })
      html += "</ul>"
    }
    html += `<button class="edit-field" data-id="${field.id}">Edit</button>`
    html += `<button class="delete-field" data-id="${field.id}">Delete</button>`
    if (index > 0) {
      html += `<button class="move-field-up" data-id="${field.id}">Move Up</button>`
    }
    if (index < totalFields - 1) {
      html += `<button class="move-field-down" data-id="${field.id}">Move Down</button>`
    }
    html += "</div>"
    return html
  }

  static renderFormPreview(form: Form, onSubmit: (formData: FormData) => void, onBack: () => void): void {
    const appContainer = document.getElementById("app")
    if (!appContainer) return

    let html = `
            <h2>Preview: ${form.name}</h2>
            <button id="backToList">Back to Form List</button>
            <form id="previewForm">
        `

    form.fields.forEach((field) => {
      html += this.renderPreviewField(field)
    })

    html += `
                <button type="submit">Submit</button>
            </form>
        `

    appContainer.innerHTML = html

    document.getElementById("backToList")?.addEventListener("click", onBack)
    document.getElementById("previewForm")?.addEventListener("submit", (e) => {
      e.preventDefault()
      onSubmit(new FormData(e.target as HTMLFormElement))
    })
  }

  private static renderPreviewField(field: FormField): string {
    let html = `<div class="preview-field">`
    html += `<label for="${field.id}">${field.label}${field.required ? " *" : ""}</label>`

    switch (field.type) {
      case "text":
      case "date":
        html += `<input type="${field.type}" id="${field.id}" name="${field.id}" ${field.required ? "required" : ""}>`
        break
      case "textarea":
        html += `<textarea id="${field.id}" name="${field.id}" ${field.required ? "required" : ""}></textarea>`
        break
      case "radio":
      case "checkbox":
        field.options?.forEach((option, index) => {
          html += `
              <div>
                  <input type="${field.type}" id="${field.id}_${index}" name="${field.id}" value="${option}" ${field.required ? "required" : ""}>
                  <label for="${field.id}_${index}">${option}</label>
              </div>
          `
        })
        break
      case "select":
        html += `<select id="${field.id}" name="${field.id}" ${field.required ? "required" : ""}>`
        html += `<option value="">Select an option</option>`
        field.options?.forEach((option) => {
          html += `<option value="${option}">${option}</option>`
        })
        html += `</select>`
        break
    }
    html += "</div>"
    return html
  }

  static showModal(id: string): void {
    const modal = document.getElementById(id) as HTMLElement
    if (modal) {
      modal.style.display = "block"
    }
  }

  static closeModal(id: string): void {
    const modal = document.getElementById(id) as HTMLElement
    if (modal) {
      modal.style.display = "none"
    }
  }

  static showMessage(message: string): void {
    const messageElement = document.createElement("div")
    messageElement.textContent = message
    messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1000;
        `
    document.body.appendChild(messageElement)
    setTimeout(() => {
      document.body.removeChild(messageElement)
    }, 3000)
  }
}