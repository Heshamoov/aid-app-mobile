export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {start:"_app/immutable/entry/start.C9n-yogX.js",app:"_app/immutable/entry/app.BJD1a7hy.js",imports:["_app/immutable/entry/start.C9n-yogX.js","_app/immutable/chunks/C9t7Hmsj.js","_app/immutable/chunks/C1cF_f_f.js","_app/immutable/entry/app.BJD1a7hy.js","_app/immutable/chunks/C1cF_f_f.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/oCXtbbpy.js","_app/immutable/chunks/BhgOVFHs.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/forms",
				pattern: /^\/forms\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/forms/[id]",
				pattern: /^\/forms\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
