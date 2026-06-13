On/off toggle. Coral when on; 44px-friendly hit area.

```jsx
<Switch defaultChecked onCheckedChange={(v) => setAutoReport(v)} />
<Switch checked={shareLocation} onCheckedChange={setShareLocation} size="sm" />
```

Controlled (`checked` + `onCheckedChange`) or uncontrolled (`defaultChecked`). Sizes `sm` / `default`.
