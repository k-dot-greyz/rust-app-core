import { Show } from "solid-js";

let mounts = 0;

export function Field(props: { stamp: string; value: string | number; mark?: boolean }) {
  const mount = (mounts += 1);
  const bucket = { n: 0 };
  return (
    <span class="field">
      <span class="field-value">{props.value}</span>
      <Show when={props.mark}>
        <span
          class="field-meta"
          aria-hidden="true"
          data-stamp={props.stamp}
          data-mount={String(mount)}
          title={`mount ${mount}`}
        >
          {` · ${track(props.value, bucket)}`}
        </span>
      </Show>
    </span>
  );
}

function track(value: string | number, bucket: { n: number }): number {
  void value;
  bucket.n += 1;
  return bucket.n;
}
