import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("about", "routes/about.tsx"),
    route("timeline", "routes/timeline.tsx"),
    route("offline-webrtc", "routes/offline-webrtc.tsx"),
] satisfies RouteConfig;
