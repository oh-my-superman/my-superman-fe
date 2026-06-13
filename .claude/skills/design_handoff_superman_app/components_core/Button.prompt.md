One-tap action button — coral fill by default, sized 44px for thumbs.

```jsx
<Button onClick={callNow}>지금 전화 받기</Button>
<Button variant="outline" size="lg" block>예약하기</Button>
<Button variant="destructive">112 신고</Button>
<Button variant="ghost" size="icon" aria-label="설정"><GearIcon /></Button>
```

Variants: `default` (coral CTA) · `secondary` (warm gray) · `outline` · `ghost` · `destructive` (emergency red — danger only) · `link`.
Sizes: `sm` 36 · `default` 44 · `lg` 52 · `icon` / `icon-sm` (square). Pass `block` to fill width — common for the bottom-of-screen primary action.
