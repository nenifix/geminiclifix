/**
 * Computer Use Tools for NeniCoder
 *
 * Desktop automation: screenshots, mouse control, keyboard input, window management.
 * Uses platform-native commands — no extra npm packages needed.
 *
 * Windows: PowerShell + .NET (System.Windows.Forms, System.Drawing)
 * macOS:   screencapture, osascript
 * Linux:   scrot/import, xdotool, wmctrl
 *
 * Tools:
 *   computer_screenshot   — Capture the screen
 *   computer_click        — Click at coordinates
 *   computer_type         — Type text via keyboard
 *   computer_key          — Press a key or key combo
 *   computer_move         — Move mouse to coordinates
 *   computer_scroll       — Scroll mouse wheel
 *   computer_window       — List/focus/minimize/maximize/close windows
 *   computer_clipboard    — Read/write clipboard
 *   computer_screen_info  — Get screen resolution and info
 *   computer_pixel        — Get pixel color at coordinates
 */

import { execSync, exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { config } from "../config.js";

const IS_WINDOWS = process.platform === "win32";
const IS_MAC = process.platform === "darwin";
const IS_LINUX = process.platform === "linux";

// ── Helpers ───────────────────────────────────────────────

function runCmd(cmd: string, timeout = 10000): string {
  try {
    return execSync(cmd, { timeout, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch (err: any) {
    return `Error: ${err.message}`;
  }
}

function runCmdAsync(cmd: string): Promise<string> {
  return new Promise((resolve) => {
    exec(cmd, { timeout: 15000, encoding: "utf-8" }, (err, stdout, stderr) => {
      if (err) resolve(`Error: ${err.message}`);
      else resolve((stdout || "").trim());
    });
  });
}

function screenshotsDir(): string {
  const dir = path.join(config.workspace, "screenshots");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ── Screenshot ────────────────────────────────────────────

export async function computerScreenshot(filename?: string, fullScreen = true): Promise<string> {
  const name = filename || `screen-${Date.now()}.png`;
  const filePath = path.join(screenshotsDir(), name);

  if (IS_WINDOWS) {
    // Use PowerShell + .NET to capture screen
    const ps = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bitmap = New-Object System.Drawing.Bitmap($bounds.Width, $bounds.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
$bitmap.Save('${filePath.replace(/\\/g, "\\\\")}')
$graphics.Dispose()
$bitmap.Dispose()
`;
    const result = runCmd(`powershell -NoProfile -Command "${ps.replace(/\n/g, " ")}"`);
    if (result.startsWith("Error")) return result;
    return `Screenshot saved: ${filePath}`;
  }

  if (IS_MAC) {
    const result = runCmd(`screencapture -x ${filePath}`);
    if (result.startsWith("Error")) return result;
    return `Screenshot saved: ${filePath}`;
  }

  if (IS_LINUX) {
    // Try import (ImageMagick) then scrot
    let result = runCmd(`import -window root ${filePath}`);
    if (result.startsWith("Error")) {
      result = runCmd(`scrot ${filePath}`);
    }
    if (result.startsWith("Error")) return result;
    return `Screenshot saved: ${filePath}`;
  }

  return "Screenshot not supported on this platform.";
}

// ── Mouse Control ─────────────────────────────────────────

export async function computerClick(x: string, y: string, button = "left", doubleClick = false): Promise<string> {
  const px = parseInt(x) || 0;
  const py = parseInt(y) || 0;

  if (IS_WINDOWS) {
    const ps = `
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${px}, ${py})
$signature = @"
[DllImport("user32.dll")]
public static extern void mouse_event(int flags, int dx, int dy, int data, int extra);
"@
$mouse = Add-Type -MemberDefinition $signature -Name "Mouse" -Namespace "Win32" -PassThru
$down = 0x0002; $up = 0x0004
if ("${button}" -eq "right") { $down = 0x0008; $up = 0x0010 }
$mouse::mouse_event($down, 0, 0, 0, 0)
Start-Sleep -Milliseconds 50
$mouse::mouse_event($up, 0, 0, 0, 0)
${doubleClick ? `
Start-Sleep -Milliseconds 50
$mouse::mouse_event($down, 0, 0, 0, 0)
Start-Sleep -Milliseconds 50
$mouse::mouse_event($up, 0, 0, 0, 0)
` : ""}
`;
    runCmd(`powershell -NoProfile -Command "${ps.replace(/\n/g, " ")}"`);
    return `Clicked ${button} at (${px}, ${py})${doubleClick ? " (double)" : ""}`;
  }

  if (IS_MAC) {
    const btn = button === "right" ? "2" : "1";
    runCmd(`cliclick c:${px},${py}`);
    return `Clicked ${button} at (${px}, ${py})`;
  }

  if (IS_LINUX) {
    const btn = button === "right" ? "3" : "1";
    runCmd(`xdotool mousemove ${px} ${py} click ${btn}`);
    return `Clicked ${button} at (${px}, ${py})`;
  }

  return "Mouse click not supported on this platform.";
}

export async function computerMove(x: string, y: string): Promise<string> {
  const px = parseInt(x) || 0;
  const py = parseInt(y) || 0;

  if (IS_WINDOWS) {
    const ps = `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${px}, ${py})`;
    runCmd(`powershell -NoProfile -Command "${ps}"`);
    return `Mouse moved to (${px}, ${py})`;
  }
  if (IS_MAC) {
    runCmd(`cliclick m:${px},${py}`);
    return `Mouse moved to (${px}, ${py})`;
  }
  if (IS_LINUX) {
    runCmd(`xdotool mousemove ${px} ${py}`);
    return `Mouse moved to (${px}, ${py})`;
  }
  return "Mouse move not supported on this platform.";
}

export async function computerScroll(direction: string, amount = "3"): Promise<string> {
  const amt = parseInt(amount) || 3;

  if (IS_WINDOWS) {
    const ps = `
Add-Type -AssemblyName System.Windows.Forms
$signature = @"
[DllImport("user32.dll")]
public static extern void mouse_event(int flags, int dx, int dy, int data, int extra);
"@
$mouse = Add-Type -MemberDefinition $signature -Name "Mouse" -Namespace "Win32" -PassThru
$wheel = 0x0800
$delta = ${direction === "down" ? -amt * 120 : amt * 120}
$mouse::mouse_event($wheel, 0, 0, $delta, 0)
`;
    runCmd(`powershell -NoProfile -Command "${ps.replace(/\n/g, " ")}"`);
    return `Scrolled ${direction} (${amt} ticks)`;
  }
  if (IS_MAC) {
    const delta = direction === "down" ? `-${amt}` : amt;
    runCmd(`cliclick w:${delta}`);
    return `Scrolled ${direction} (${amt} ticks)`;
  }
  if (IS_LINUX) {
    const btn = direction === "down" ? "5" : "4";
    runCmd(`xdotool click --repeat ${amt} ${btn}`);
    return `Scrolled ${direction} (${amt} ticks)`;
  }
  return "Scroll not supported on this platform.";
}

// ── Keyboard Control ──────────────────────────────────────

export async function computerType(text: string, delayMs = "0"): Promise<string> {
  const delay = parseInt(delayMs) || 0;

  if (IS_WINDOWS) {
    // Use PowerShell SendKeys
    const escaped = text.replace(/'/g, "''");
    const ps = `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('${escaped}')`;
    runCmd(`powershell -NoProfile -Command "${ps}"`);
    return `Typed: "${text.slice(0, 50)}${text.length > 50 ? "..." : ""}"`;
  }
  if (IS_MAC) {
    const escaped = text.replace(/"/g, '\\"');
    runCmd(`osascript -e 'tell application "System Events" to keystroke "${escaped}"'`);
    return `Typed: "${text.slice(0, 50)}${text.length > 50 ? "..." : ""}"`;
  }
  if (IS_LINUX) {
    const escaped = text.replace(/'/g, "'\\''");
    runCmd(`xdotool type --delay ${delay} '${escaped}'`);
    return `Typed: "${text.slice(0, 50)}${text.length > 50 ? "..." : ""}"`;
  }
  return "Type not supported on this platform.";
}

export async function computerKey(key: string): Promise<string> {
  // Key combos: "ctrl+c", "ctrl+v", "alt+tab", "win+r", "enter", "escape", "tab", etc.

  if (IS_WINDOWS) {
    const keyMap: Record<string, string> = {
      "enter": "{ENTER}", "return": "{ENTER}", "tab": "{TAB}",
      "escape": "{ESC}", "esc": "{ESC}", "backspace": "{BACKSPACE}",
      "delete": "{DELETE}", "up": "{UP}", "down": "{DOWN}",
      "left": "{LEFT}", "right": "{RIGHT}", "home": "{HOME}",
      "end": "{END}", "pageup": "{PGUP}", "pagedown": "{PGDN}",
      "space": " ", "f1": "{F1}", "f2": "{F2}", "f3": "{F3}",
      "f4": "{F4}", "f5": "{F5}", "f6": "{F6}", "f7": "{F7}",
      "f8": "{F8}", "f9": "{F9}", "f10": "{F10}", "f11": "{F11}", "f12": "{F12}",
    };

    let combo = key.toLowerCase();
    let sendKeys = "";

    if (combo.includes("+")) {
      const parts = combo.split("+");
      const k = parts.pop()!;
      const modifiers = parts;
      let modStr = "";
      for (const m of modifiers) {
        if (m === "ctrl" || m === "control") modStr += "^";
        else if (m === "alt") modStr += "%";
        else if (m === "shift") modStr += "+";
        else if (m === "win") modStr += "#";
      }
      sendKeys = modStr + (keyMap[k] || k);
    } else {
      sendKeys = keyMap[combo] || combo;
    }

    const ps = `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('${sendKeys}')`;
    runCmd(`powershell -NoProfile -Command "${ps}"`);
    return `Key pressed: ${key}`;
  }

  if (IS_MAC) {
    const keyMap: Record<string, string> = {
      "enter": "return", "return": "return", "tab": "tab",
      "escape": "escape", "esc": "escape", "backspace": "delete",
      "delete": "delete", "up": "126", "down": "125",
      "left": "123", "right": "124", "space": "space",
    };

    let cmd = "";
    if (key.includes("+")) {
      const parts = key.split("+");
      const k = parts.pop()!;
      const mods = parts;
      let modFlags = "";
      for (const m of mods) {
        if (m === "ctrl") modFlags += " control down";
        else if (m === "alt") modFlags += " option down";
        else if (m === "shift") modFlags += " shift down";
        else if (m === "cmd" || m === "win") modFlags += " command down";
      }
      const keyCode = keyMap[k.toLowerCase()] || k;
      cmd = `osascript -e 'tell application "System Events" to key code ${keyCode} using {${modFlags.trim()}}'`;
    } else {
      const keyCode = keyMap[key.toLowerCase()] || key;
      cmd = `osascript -e 'tell application "System Events" to keystroke "${keyCode}"'`;
    }
    runCmd(cmd);
    return `Key pressed: ${key}`;
  }

    let keySpec = key;
    if (IS_LINUX) {
      keySpec = key.replace(/\+/g, "+");
      runCmd(`xdotool key ${keySpec}`);
      return `Key pressed: ${key}`;
    }

  return "Key press not supported on this platform.";
}

// ── Window Management ─────────────────────────────────────

export async function computerWindow(action: string, target?: string): Promise<string> {
  if (IS_WINDOWS) {
    switch (action) {
      case "list": {
        const ps = `Get-Process | Where-Object {$_.MainWindowTitle -ne ""} | Select-Object ProcessName, MainWindowTitle, Id | Format-Table -AutoSize`;
        const result = runCmd(`powershell -NoProfile -Command "${ps}"`);
        return result || "No windows found.";
      }
      case "focus": {
        if (!target) return "Error: window title required";
        const ps = `Add-Type -AssemblyName System.Windows.Forms; $proc = Get-Process | Where-Object {$_.MainWindowTitle -like "*${target}*"}; if ($proc) { [System.Windows.Forms.SendKeys]::SendWait('%{TAB}') }`;
        runCmd(`powershell -NoProfile -Command "${ps}"`);
        return `Focused window: ${target}`;
      }
      case "minimize": {
        const ps = `(New-Object -ComObject Shell.Application).MinimizeAll()`;
        runCmd(`powershell -NoProfile -Command "${ps}"`);
        return "All windows minimized.";
      }
      default:
        return `Unknown action: ${action}. Use: list, focus, minimize`;
    }
  }

  if (IS_MAC) {
    switch (action) {
      case "list":
        return runCmd(`osascript -e 'tell application "System Events" to get name of every process whose background only is false'`);
      case "focus":
        if (!target) return "Error: app name required";
        return runCmd(`osascript -e 'tell application "${target}" to activate'`);
      case "minimize":
        return runCmd(`osascript -e 'tell application "System Events" to set miniaturized of every window to true'`);
      default:
        return `Unknown action: ${action}`;
    }
  }

  if (IS_LINUX) {
    switch (action) {
      case "list":
        return runCmd(`wmctrl -l`);
      case "focus":
        if (!target) return "Error: window name required";
        return runCmd(`wmctrl -a "${target}"`);
      case "minimize":
        return runCmd(`xdotool getactivewindow windowminimize`);
      default:
        return `Unknown action: ${action}`;
    }
  }

  return "Window management not supported on this platform.";
}

// ── Clipboard ─────────────────────────────────────────────

export async function computerClipboard(action: string, text?: string): Promise<string> {
  if (action === "read") {
    if (IS_WINDOWS) {
      return runCmd(`powershell -NoProfile -Command "Get-Clipboard"`);
    }
    if (IS_MAC) {
      return runCmd(`pbpaste`);
    }
    if (IS_LINUX) {
      return runCmd(`xclip -selection clipboard -o 2>/dev/null || xsel --clipboard --output 2>/dev/null`);
    }
  }

  if (action === "write") {
    if (!text) return "Error: text required";
    if (IS_WINDOWS) {
      const escaped = text.replace(/"/g, '\\"').replace(/\n/g, "`n");
      runCmd(`powershell -NoProfile -Command "Set-Clipboard -Value \\"${escaped}\\""`);
      return `Clipboard set: "${text.slice(0, 50)}${text.length > 50 ? "..." : ""}"`;
    }
    if (IS_MAC) {
      const escaped = text.replace(/"/g, '\\"');
      runCmd(`echo "${escaped}" | pbcopy`);
      return `Clipboard set: "${text.slice(0, 50)}${text.length > 50 ? "..." : ""}"`;
    }
    if (IS_LINUX) {
      const escaped = text.replace(/'/g, "'\\''");
      runCmd(`echo '${escaped}' | xclip -selection clipboard`);
      return `Clipboard set: "${text.slice(0, 50)}${text.length > 50 ? "..." : ""}"`;
    }
  }

  return `Unknown action: ${action}. Use: read, write`;
}

// ── Screen Info ───────────────────────────────────────────

export async function computerScreenInfo(): Promise<string> {
  if (IS_WINDOWS) {
    const ps = `
Add-Type -AssemblyName System.Windows.Forms
$screen = [System.Windows.Forms.Screen]::PrimaryScreen
"Resolution: $($screen.Bounds.Width) x $($screen.Bounds.Height)"
"Working Area: $($screen.WorkingArea.Width) x $($screen.WorkingArea.Height)"
"DPI: $($screen.Dpi)"
"Primary: $($screen.Primary)"
"Mouse: $([System.Windows.Forms.Cursor].Position.X), $([System.Windows.Forms.Cursor].Position.Y)"
`;
    return runCmd(`powershell -NoProfile -Command "${ps.replace(/\n/g, " ")}"`);
  }
  if (IS_MAC) {
    const res = runCmd(`system_profiler SPDisplaysDataType 2>/dev/null | grep Resolution`);
    const mouse = runCmd(`osascript -e 'tell application "System Events" to get {x, y} of mouse location'`);
    return `${res}\nMouse: ${mouse}`;
  }
  if (IS_LINUX) {
    const res = runCmd(`xrandr --current | grep "\\*" | head -1`);
    return `Resolution: ${res}`;
  }
  return "Screen info not supported on this platform.";
}

// ── Pixel Color ───────────────────────────────────────────

export async function computerPixel(x: string, y: string): Promise<string> {
  const px = parseInt(x) || 0;
  const py = parseInt(y) || 0;

  if (IS_WINDOWS) {
    const ps = `
Add-Type -AssemblyName System.Drawing
$bitmap = New-Object System.Drawing.Bitmap(1, 1)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen(${px}, ${py}, 0, 0, (New-Object System.Drawing.Size(1, 1)))
$pixel = $bitmap.GetPixel(0, 0)
"RGB($($pixel.R), $($pixel.G), $($pixel.B))"
"#$($pixel.R.ToString('X2'))$($pixel.G.ToString('X2'))$($pixel.B.ToString('X2'))"
$graphics.Dispose()
$bitmap.Dispose()
`;
    return runCmd(`powershell -NoProfile -Command "${ps.replace(/\n/g, " ")}"`);
  }
  if (IS_MAC) {
    const result = runCmd(`screencapture -R${px},${py},1,1 -t bmp /tmp/pixel.bmp && python3 -c "
from PIL import Image
img = Image.open('/tmp/pixel.bmp')
p = img.getpixel((0,0))
print(f'RGB({p[0]}, {p[1]}, {p[2]})')
print(f'#{p[0]:02X}{p[1]:02X}{p[2]:02X}')
" 2>/dev/null || echo "Requires Python PIL"`);
    return result;
  }
  if (IS_LINUX) {
    return runCmd(`import -window root -crop 1x1+${px}+${py} -format "%[pixel:u]" info:- 2>/dev/null || echo "Requires ImageMagick"`);
  }
  return "Pixel color not supported on this platform.";
}
