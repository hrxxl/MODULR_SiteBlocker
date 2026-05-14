========================================
  SiteBlock — Browser Extension
  README
========================================

OVERVIEW
--------
SiteBlock is a lightweight browser extension that lets you block distracting
or unwanted websites with a single click. Manage a personal blocklist, toggle
individual sites on or off, and pause all blocking instantly with a master
switch — all from a clean, minimal popup interface.


FEATURES
--------
- Add any website to your blocklist by entering a domain (e.g. twitter.com)
- Per-site toggle: pause blocking for individual sites without removing them
- Master toggle: pause or resume all blocking at once
- Live stats: see how many sites are active, paused, or blocked in total
- Favicon display: each blocked site shows its icon for quick recognition
- Duplicate detection: warns you if a domain is already in your list
- Input validation: catches invalid domain formats before they're added
- Clear All: remove every site from the list in one action (with confirmation)
- Persistent storage: your blocklist is saved locally and survives browser restarts


HOW TO USE
----------
1. Click the SiteBlock icon in your browser toolbar to open the popup.

2. ADD A SITE
   - Type a domain into the input field (e.g. "reddit.com" or "https://youtube.com")
   - Press Enter or click the Add button
   - The domain is automatically cleaned (strips http://, www., paths, etc.)

3. TOGGLE A SITE
   - Click the toggle switch next to any site to pause or resume blocking for it
   - A blue toggle = blocking active; grey toggle = paused

4. REMOVE A SITE
   - Click the × button next to a site to remove it from your list
   - The site will slide out with a smooth animation

5. MASTER TOGGLE
   - The toggle at the top of the popup controls all blocking globally
   - When paused, no sites are blocked regardless of individual settings
   - The status label shows "Active" or "Paused"

6. CLEAR ALL
   - Click "Clear All" to remove every site from the list
   - A confirmation prompt will appear before anything is deleted

7. STATS BAR
   - Total: number of sites in your list
   - Active: sites currently being blocked
   - Paused: sites in your list but not being blocked


INSTALLATION (Developer / Unpacked)
------------------------------------
1. Download or clone the extension files to a local folder.
2. Open your browser and navigate to the Extensions page:
   - Chrome / Edge: chrome://extensions
   - Brave: brave://extensions
3. Enable "Developer mode" (toggle in the top-right corner).
4. Click "Load unpacked" and select the extension folder.
5. The SiteBlock icon will appear in your toolbar.


FILE STRUCTURE
--------------
  popup.html        — Extension popup UI
  popup.js          — Popup logic (add, remove, toggle sites; storage; stats)
  background.js     — Service worker that applies blocking rules via the
                      declarativeNetRequest API
  manifest.json     — Extension manifest (permissions, metadata)
  icons/            — Extension icons


PERMISSIONS USED
----------------
- storage              : Saves your blocklist and settings locally
- declarativeNetRequest: Applies network-level blocking rules
- runtime messaging    : Syncs rule changes between popup and background worker


NOTES
-----
- Blocking is applied at the network level, so sites are blocked before they
  load — not just hidden after the fact.
- Your data never leaves your device; everything is stored locally via
  chrome.storage.local.
- Domains are case-insensitive and automatically normalised on input.


TROUBLESHOOTING
---------------
- Site not being blocked?
  Check that both the master toggle and the site's individual toggle are active.
  Try reloading the tab after adding the site.

- "Already in your list" error?
  The domain (stripped of www. and paths) matches one already saved.

- Extension not loading?
  Ensure Developer Mode is enabled and the correct folder was selected during
  "Load unpacked".


========================================
  Built with care. Block smarter.
========================================
