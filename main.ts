import { FrontMatterCache, Plugin } from "obsidian";
import { getAPI, LocalRestApiPublicApi } from "obsidian-local-rest-api";
import { Frontmatter } from "src/obsidian-api/frontmatter";

export default class ObsidianLocalRESTAPISamplePlugin extends Plugin {
	private api: LocalRestApiPublicApi;
	private frontmatter: Frontmatter;

	registerRoutes() {
		// Here is how you register your routes:
		//
		// 1. Get an API handle:
		this.api = getAPI(this.app, this.manifest);
		this.frontmatter = new Frontmatter(() => this.app)

		// 2. Add your routes -- `addRoute` returns a route object
		//    https://www.geeksforgeeks.org/express-js-router-route-function/
		//    that you can attach handlers to
		this.api.addRoute("/frontmatter/(.*)")
			.get((request, response) => {
				const path = request.params[0];

				const result = this.frontmatter.read(path);

				response.status(200).json({
					frontmatter: result
				});
			})
			.post(async (request, response) => {
				const path = request.params[0];

				if (request.query == null) {
					throw new Error("Frontmatter fields to update aren't found in the request params.")
				}

				await this.frontmatter.write(path, request.query)

				response.status(200).json({
					sample_plugin_response_ok: true,
				});
			});

		// For more insight into what you can put into a route, have
		// a look at the existing routes that are handled by
		// the API itself: https://github.com/coddingtonbear/obsidian-local-rest-api/blob/main/src/requestHandler.ts
	}

	// Everything below this point can be left as it is -- this is just
	// setting up machinery to properly register your routes with
	// Obsidian Local REST API
	async onload() {

		if (this.app.plugins.enabledPlugins.has("obsidian-local-rest-api")) {
			this.registerRoutes();
		}

		this.registerEvent(
			this.app.workspace.on(
				"obsidian-local-rest-api:loaded",
				this.registerRoutes.bind(this)
			)
		);
	}

	onunload() {
		if (this.api && typeof (this.api as any).unregister === 'function') {
			(this.api as any).unregister();
		}
	}
}

declare module "obsidian" {
	interface App {
		plugins: {
			enabledPlugins: Set<string>;
		};
	}

	interface Workspace {
		on(
			name: "obsidian-local-rest-api:loaded",
			callback: () => void,
			ctx?: any
		): EventRef;
	}
}
