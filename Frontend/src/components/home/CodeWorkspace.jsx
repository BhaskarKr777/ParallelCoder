const users = [
    "Bhaskar",
    "Sarah",
    "Alex",
];

const CodeWorkspace = () => {
    return (
        <section
            id="workspace"
            className="bg-black text-white py-28 px-6"
        >
            <div className="max-w-7xl mx-auto">

                {/* Heading */}
                <div className="text-center max-w-3xl mx-auto mb-20">

                    <p className="text-zinc-500 uppercase tracking-[0.25em] text-sm">
                        Workspace
                    </p>

                    <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mt-4">
                        Code together
                        <br />
                        in realtime.
                    </h2>

                    <p className="text-zinc-400 mt-6 text-lg">
                        Built for collaborative coding
                        with realtime editing and shared workspaces.
                    </p>

                </div>

                {/* Editor Container */}
                <div className="rounded-[28px] sm:rounded-[36px] overflow-hidden border border-zinc-800 bg-[#0F0F11] shadow-[0_0_60px_rgba(255,255,255,0.03)]">

                    <div className="grid lg:grid-cols-[280px_1fr] min-h-[480px] sm:min-h-[540px]">

                        {/* Sidebar */}
                        <aside className="bg-zinc-950 border-b lg:border-b-0 lg:border-r border-zinc-800 p-5 sm:p-6 text-white">

                            <h2 className="text-xl sm:text-2xl font-bold border-b border-zinc-800 pb-4 text-white">
                                Active Users
                            </h2>

                            <ul className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">

                                {users.map((user) => (
                                    <li
                                        key={user}
                                        className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900/80 text-zinc-200 border border-zinc-800/80 hover:bg-zinc-800/80 transition flex items-center justify-between text-sm sm:text-base font-medium"
                                    >
                                        <span>{user}</span>
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                    </li>
                                ))}

                            </ul>

                            <div className="mt-6 sm:mt-8 flex items-center gap-3 text-xs sm:text-sm text-zinc-400">

                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />

                                3 collaborators online
                            </div>

                        </aside>

                        {/* Monaco-like Editor */}
                        <section className="bg-gray-950 overflow-hidden">

                            {/* Topbar */}
                            <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-5 bg-[#18181B]">

                                <div className="flex items-center gap-4">

                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                    </div>

                                    <div className="bg-zinc-900 px-4 py-1 rounded-lg text-sm text-zinc-400">
                                        Hero.jsx
                                    </div>

                                </div>

                                <span className="text-zinc-500 text-sm">
                                    JavaScript
                                </span>

                            </div>

                            {/* Code Area */}
                            <div className="font-mono text-sm p-8 text-zinc-300 space-y-3 overflow-hidden">

                                <p>
                                    <span className="text-purple-400">
                                        import
                                    </span>{" "}
                                    React{" "}
                                    <span className="text-purple-400">
                                        from
                                    </span>{" "}
                                    <span className="text-green-400">
                                        "react"
                                    </span>
                                </p>

                                <p className="text-zinc-400 mt-6">
                                    const Hero = () =&gt; {"{"}
                                </p>

                                <p className="ml-6 text-blue-400">
                                    return (
                                </p>

                                <p className="ml-12 text-green-400">
                                    &lt;h1&gt;
                                </p>

                                <p className="ml-16 text-zinc-200">
                                    Build software together
                                </p>

                                <p className="ml-12 text-green-400">
                                    &lt;/h1&gt;
                                </p>

                                <p className="ml-6 text-blue-400">
                                    )
                                </p>

                                <p className="text-zinc-400">
                                    {"}"}
                                </p>

                                {/* Cursor */}
                                <div className="mt-10 flex items-center gap-3">

                                    <div className="w-2 h-6 bg-green-400 animate-pulse" />

                                    <span className="text-green-400 text-sm">
                                        Bhaskar editing...
                                    </span>

                                </div>

                            </div>

                        </section>

                    </div>

                </div>

            </div>
        </section>
    );
};

export default CodeWorkspace;