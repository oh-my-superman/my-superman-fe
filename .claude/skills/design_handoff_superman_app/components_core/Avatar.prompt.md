Round avatar for personas/people, with image fallback and a status dot.

```jsx
<Avatar src={mom.photo} fallback="엄" status="online" />
<Avatar fallback="👮" size="lg" bg="var(--coral-50)" />
<Avatar size="xl" fallback="민지" status="busy" />   {/* call screen */}
```

Sizes: `sm` 32 · `default` 44 · `lg` 64 · `xl` 96. `status`: `online` (green, 동행 중) · `busy` (red, 위급) · `idle` (gray). Use `bg`/`fg` to tint the fallback per persona.
