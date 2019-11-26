[Extra match for the symbols](https://regex101.com/r/Bfr0ed/1)

```plist
<!-- Edits -->
<key>match</key>
<string>((>)(.*) : Symbol\(([\w\.]*).*)</string>
<key>captures</key>
<dict>
  <key>1</key>
  <dict>
    <key>name</key>
    <!-- whole line -->
    <string>comment.line.double-slash.ts</string>
  </dict>
  <key>2</key>
  <dict>
    <key>name</key>
    <!-- > -->
    <string>comment.line.double-slash.opener</string>
  </dict>
  <key>3</key>
  <dict>
    <key>name</key>
    <!-- Thing this represents -->
    <string>meta.parameters.ts</string>
  </dict>
    <key>4</key>
  <dict>
    <key>name</key>
    <!-- thing inside -->
    <string>meta.parameters.ts</string>
  </dict>
</dict>
</dict>
```
