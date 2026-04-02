// Declaraciones de tipos para Google Picker API
declare namespace google.picker {
  enum Action {
    CANCEL = 'cancel',
    PICKED = 'picked',
  }

  enum ViewId {
    DOCS = 'all',
    DOCS_IMAGES = 'docs-images',
    DOCS_VIDEOS = 'docs-videos',
    FOLDERS = 'folders',
  }

  interface Document {
    id: string
    name: string
    mimeType: string
    url: string
    iconUrl: string
    description: string
    type: string
    lastEditedUtc: number
    sizeBytes: number
    parentId: string
  }

  interface ResponseObject {
    action: Action
    docs: Document[]
    viewToken: string[]
  }

  class DocsView {
    constructor(viewId?: ViewId)
    setIncludeFolders(include: boolean): DocsView
    setSelectFolderEnabled(enabled: boolean): DocsView
    setMimeTypes(mimeTypes: string): DocsView
    setEnableDrives(enabled: boolean): DocsView
    setMode(mode: unknown): DocsView
    setOwnedByMe(owned: boolean): DocsView
    setParent(parentId: string): DocsView
    setQuery(query: string): DocsView
  }

  class PickerBuilder {
    constructor()
    addView(view: DocsView): PickerBuilder
    setOAuthToken(token: string): PickerBuilder
    setDeveloperKey(key: string): PickerBuilder
    setCallback(callback: (data: ResponseObject) => void): PickerBuilder
    setTitle(title: string): PickerBuilder
    setLocale(locale: string): PickerBuilder
    setOrigin(origin: string): PickerBuilder
    setSize(width: number, height: number): PickerBuilder
    enableFeature(feature: unknown): PickerBuilder
    disableFeature(feature: unknown): PickerBuilder
    build(): Picker
  }

  class Picker {
    setVisible(visible: boolean): void
    isVisible(): boolean
    dispose(): void
  }
}

// Extensión del window global para gapi
interface Window {
  gapi: {
    load: (api: string, callback: () => void) => void
    client: {
      init: (config: Record<string, unknown>) => Promise<void>
    }
  }
}
