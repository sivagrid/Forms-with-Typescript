import type { Form, FormResponse } from "./types"

export class StorageManager {
  private static readonly FORMS_STORAGE_KEY = "form_builder_forms"
  private static readonly RESPONSES_STORAGE_KEY = "form_builder_responses"

  static getForms(): Form[] {
    const storedForms = localStorage.getItem(this.FORMS_STORAGE_KEY)
    return storedForms ? JSON.parse(storedForms) : []
  }

  static saveForms(forms: Form[]): void {
    localStorage.setItem(this.FORMS_STORAGE_KEY, JSON.stringify(forms))
  }

  static deleteForm(formId: string): void {
    const forms = this.getForms().filter((f) => f.id !== formId)
    this.saveForms(forms)
    this.deleteResponses(formId)
  }

  static getResponses(formId: string): FormResponse[] {
    const allResponses = this.getAllResponses()
    return allResponses.filter((response) => response.formId === formId)
  }

  static saveResponse(response: FormResponse): void {
    const responses = this.getAllResponses()
    responses.push(response)
    localStorage.setItem(this.RESPONSES_STORAGE_KEY, JSON.stringify(responses))
  }

  static getLastResponse(formId: string): FormResponse | null {
    const responses = this.getResponses(formId)
    return responses.length > 0 ? responses[responses.length - 1] : null
  }

  private static getAllResponses(): FormResponse[] {
    const storedResponses = localStorage.getItem(this.RESPONSES_STORAGE_KEY)
    return storedResponses ? JSON.parse(storedResponses) : []
  }

  private static deleteResponses(formId: string): void {
    const responses = this.getAllResponses().filter((r) => r.formId !== formId)
    localStorage.setItem(this.RESPONSES_STORAGE_KEY, JSON.stringify(responses))
  }
}
