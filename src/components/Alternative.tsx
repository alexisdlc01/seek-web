import { PropsWithChildren } from "react";

type AlternativeProps<T> = PropsWithChildren<{
	ok: boolean;
	fallback: React.ReactNode;
}>;

export function Alternative<T>({ ok, fallback, children }: AlternativeProps<T>) {
	return (
		ok ? children : fallback
	)
}
