Controlled modal / bottom sheet over a dim overlay. ESC and overlay-click close it.

```jsx
const [open, setOpen] = React.useState(false)

;<Dialog open={open} onOpenChange={setOpen} tone="danger">
  <DialogHeader>
    <DialogTitle>위급 상황이 감지됐어요</DialogTitle>
    <DialogDescription>
      10초 뒤 보호자에게 위치와 녹음이 전송됩니다.
    </DialogDescription>
  </DialogHeader>
  <DialogFooter>
    <Button variant="destructive" block>
      지금 신고
    </Button>
    <Button variant="ghost" block onClick={() => setOpen(false)}>
      괜찮아요, 취소
    </Button>
  </DialogFooter>
</Dialog>
```

`bottomSheet` slides up from the bottom (mobile default). `tone="danger"` adds a red ring for 신고/위급. Inside a phone-frame mockup it positions absolutely; pass `container="fixed"` for full-viewport use.
