/*
  y-websocket's bin/utils.cjs reads process.env.YPERSISTENCE at
  module-load time to decide whether to wire up its built-in LevelDB
  persistence (see node_modules/y-websocket/bin/utils.cjs) - without
  it, every Y.Doc lives only in this process's memory, so a crash or
  restart loses anything typed since the last debounced save to
  Postgres (editorManager.js, 1.5s).

  This has to run and finish *before* "y-websocket/bin/utils" is
  imported in yjs-server.js. A plain statement placed before that
  import in the same file would NOT be early enough: ES modules fully
  evaluate all of a file's imported dependencies, in the order their
  import declarations appear, before running any of that file's own
  top-level statements - so this needs to be its own imported module,
  not inline code.

  Known characteristic, not a bug: y-websocket's own persistence hook
  (getYDoc in utils.cjs) does not await the LevelDB load before a
  newly-created doc's first sync response goes out. The very first
  connection to a room right after a restart can briefly see an empty
  doc; the disk-loaded content then arrives moments later as a normal
  CRDT update broadcast on that same connection (verified directly -
  see PR/commit history). A real editor session stays connected
  throughout, so this is invisible in practice; it would only matter
  for a client that reads once and disconnects immediately.
*/
import "dotenv/config";

process.env.YPERSISTENCE = process.env.YJS_PERSISTENCE_DIR || "./.yjs-data";
