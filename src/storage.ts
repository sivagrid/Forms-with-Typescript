// This file handles all localstorage operations for created forms and responses
 
import type { Form, FormResponse } from "./types"

// StorageManager: This is a static class for managing form and response data in localStorage
export class StorageManager {
  private static readonly FORMS_STORAGE_KEY = "form_builder_forms"
  private static readonly RESPONSES_STORAGE_KEY = "form_builder_responses"

  // Retrieve all stored forms from localStorage
  static getForms(): Form[] {
    const storedForms = localStorage.getItem(this.FORMS_STORAGE_KEY)
    return storedForms ? JSON.parse(storedForms) : []
  }

  // save all forms to localStorage
  static saveForms(forms: Form[]): void {
    localStorage.setItem(this.FORMS_STORAGE_KEY, JSON.stringify(forms))
  }

  // Delete a form responses from localStorage
  static deleteForm(formId: string): void {
    const forms = this.getForms().filter((f) => f.id !== formId)
    this.saveForms(forms)
    this.deleteResponses(formId)
  }

  // Retrieve response for a specific form
  static getResponses(formId: string): FormResponse[] {
    const allResponses = this.getAllResponses()
    return allResponses.filter((response) => response.formId === formId)
  }

  // save response
  static saveResponse(response: FormResponse): void {
    const responses = this.getAllResponses()
    responses.push(response)
    localStorage.setItem(this.RESPONSES_STORAGE_KEY, JSON.stringify(responses))
  }

  // get the response of a specific form
  static getLastResponse(formId: string): FormResponse | null {
    const responses = this.getResponses(formId)
    return responses.length > 0 ? responses[responses.length - 1] : null
  }

  // get all responses
  private static getAllResponses(): FormResponse[] {
    const storedResponses = localStorage.getItem(this.RESPONSES_STORAGE_KEY)
    return storedResponses ? JSON.parse(storedResponses) : []
  }

  // delete all responses for a specific form
  private static deleteResponses(formId: string): void {
    const responses = this.getAllResponses().filter((r) => r.formId !== formId)
    localStorage.setItem(this.RESPONSES_STORAGE_KEY, JSON.stringify(responses))
  }
}
