import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="overflow-none flex h-screen items-center justify-center">
      <div className="flex h-4/5 w-4/5 flex-col  border-x border-slate-400 md:max-w-2xl">
        {props.children}
      </div>
    </main>
  );
};
