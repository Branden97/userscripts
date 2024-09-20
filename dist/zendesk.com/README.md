# CRM Sync Notes Manager

![Version](https://img.shields.io/badge/version-0.0.1-blue)

## Overview
The **CRM Sync Notes Manager** userscript is designed to simplify the process of managing CRM Sync Notes within Zendesk Sell. It adds a convenient button to the contact page, allowing you to delete all CRM Sync Notes with a single click.

## Features
- Adds a "Delete CRM Sync Notes" button to the top of contact pages in Zendesk Sell.
- Automatically shows/hides the button based on the presence of CRM Sync Notes.
- Uses the Notyf library for visual feedback and notifications.

## Installation


1. **Install a Userscript Manager**

   See [Installation](/README.md#installation) for more info.

   - [![Tampermonkey Logo](/.github/images/README/favicons/tampermonkey.net/favicon-16.png) &nbsp;**Tampermonkey**](https://www.tampermonkey.net/) (recommended for most browsers)
   - [![Greasemonkey Logo](https://www.google.com/s2/favicons?sz=16&domain=wiki.greasespot.net) &nbsp;**Greasemonkey**](https://www.greasespot.net/)
   
2. **Install the script**:
   - [Install CRM Sync Notes Manager](https://raw.githubusercontent.com/Branden97/userscripts/main/dist/zendesk.com/notes-manager.user.js)

## How to Use
1. After installing the userscript, navigate to any contact page in Zendesk Sell.
2. If CRM Sync Notes are present, you will see a "Delete CRM Sync Notes" button appear at the top center of the page.
3. Click the button to delete all CRM Sync Notes associated with that contact.
4. A notification will confirm the action before deleting the notes.

## Future Enhancements
- [ ] Provide customizable filters for note deletion.

## Changelog
- **0.0.1** - Initial release with basic functionality for deleting all CRM Sync Notes on the contact page.

## License
TBD

## Contact
For questions or suggestions, feel free to reach out via the [GitHub repository](https://github.com/Branden97/userscripts).