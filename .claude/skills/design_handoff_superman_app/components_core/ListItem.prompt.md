Row primitive for the 전화번호부-style home and settings screens.

```jsx
<ListItem
  leading={<Avatar fallback="엄" status="online" />}
  title="엄마"
  subtitle="다정한 일상 통화 · 가장 자주 사용"
  trailing={<Badge variant="success" dot>동행 중</Badge>}
  chevron
  onClick={() => openPersona("mom")}
/>
<ListDivider />
<ListItem title="자동 신고" trailing={<Switch defaultChecked />} />
```

Give it `onClick` to make it a pressable button (hover/active). `leading`/`trailing` accept any node — Avatar, Badge, Switch, meta text. Use `ListDivider` between rows.
