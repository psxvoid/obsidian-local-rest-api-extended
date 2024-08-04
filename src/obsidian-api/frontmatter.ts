import { App, FrontMatterCache } from "obsidian"

export class Frontmatter {
	private get app(): App {
		return this.appAccessor();
	}

	constructor(private readonly appAccessor: () => App) {
	}

	read(path: string): FrontMatterCache {
		const tFile = this.app.vault.getFileByPath(path)

		if (tFile == null) {
			throw new Error("Unable to find the requested file.")
		}

		const metadata = this.app.metadataCache.getFileCache(tFile);

		if (metadata?.frontmatter == null) {
			throw new Error("Unable to get the metadata for the requested file.")
		}

		return metadata.frontmatter
	}
}
