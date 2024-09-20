// ==UserScript==
// @name         CRM Sync Notes Manager
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  Adds a button to delete all CRM Sync Notes on the current contact page in Zendesk Sell.
// @author       Branden Williams (https://github.com/Branden97)
// @match        https://sendhub.zendesk.com/sales/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zendesk.com
// @icon64       https://www.google.com/s2/favicons?sz=64&domain=zendesk.com
// @run-at       document-end
// @require      https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.js
// @resource     NotyfCSS https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css
// @connect      zendesk.com
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @downloadURL  https://raw.githubusercontent.com/Branden97/userscripts/main/dist/zendesk.com/notes-manager.user.js
// @updateURL    https://raw.githubusercontent.com/Branden97/userscripts/main/dist/zendesk.com/notes-manager.meta.js
// @homepageURL  https://github.com/Branden97/userscripts
// @supportURL   https://github.com/Branden97/userscripts/issues
// ==/UserScript==

;(async function () {
  'use strict'

  // Load external resources
  GM_addStyle(GM_getResourceText('NotyfCSS'))
  window.notyf = new Notyf({
    duration: 3000,
    position: {
      y: 'top',
    },
    ripple: false,
  })

  // Constants
  const FEED_ITEMS_SELECTOR = '.feed-items li.note-activity'
  const NOTE_TEXT = 'Updated via CRM Sync'
  const ACTIONS_MENU_SELECTOR = 'button[data-test-id="feed-item-actions-menu"]'
  const DELETE_NOTE_SELECTOR = 'li[data-action="delete-note"]'
  const MODAL_SELECTOR = 'div[class*="ModalsLayer--modal"]'
  const MODAL_TEXT_START = 'Remove this Note?'
  const REMOVE_BUTTON_TEXT = 'Remove'
  const SKIP_FIRST_NOTE = true
  const SKIP_LAST_NOTE = true
  let deleteButton

  async function main() {
    try {
      updateButtonVisibility() // Check initial visibility

      const feedItems = Array.from(
        document.querySelectorAll(FEED_ITEMS_SELECTOR)
      ).filter((el) => el.textContent.includes(NOTE_TEXT))

      for (let index = 0; index < feedItems.length; index++) {
        if (SKIP_FIRST_NOTE && index === 0) continue // Skip the first note
        if (SKIP_LAST_NOTE && index === feedItems.length) continue // Skip the last note

        const noteListItem = feedItems[index]
        noteListItem.style.backgroundColor = 'red'
        // Open the actions menu for this note
        const actionsMenuButton = noteListItem.querySelector(
          ACTIONS_MENU_SELECTOR
        )
        if (!actionsMenuButton) {
          notyf.error(
            `Couldn't find the actions menu button for note number ${index + 1}`
          )
          console.error('Actions menu button not found for note index', index)
          continue
        }
        actionsMenuButton.click()
        await new Promise((resolve) => setTimeout(resolve, 100))
        await waitForElement(DELETE_NOTE_SELECTOR)

        // Click the delete note option
        const deleteNoteButton = document.querySelector(DELETE_NOTE_SELECTOR)
        if (!deleteNoteButton) {
          notyf.error(
            `Couldn't find the delete note button for note number ${index + 1}`
          )
          console.error('Delete note button not found')
          continue
        }
        deleteNoteButton.click()
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Wait for the confirmation modal to appear
        await waitForModal(MODAL_TEXT_START)

        // Click the remove button
        clickRemoveButton()
        // wait for a second
        await new Promise((resolve) => setTimeout(resolve, 100))
        // clickCancelButton();
      }
    } catch (error) {
      notyf.error(`An error occurred: ${error?.message}`)
      console.error('An error occurred:', error)
    }
  }

  /**
   * Waits for an element matching the selector to appear in the DOM.
   * @param {string} selector - The CSS selector of the element to wait for.
   * @returns {Promise<Element>} - A promise that resolves when the element is found.
   */
  function waitForElement(selector) {
    return new Promise((resolve) => {
      const element = document.querySelector(selector)
      if (element) {
        resolve(element)
        return
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector)
        if (element) {
          obs.disconnect()
          resolve(element)
        }
      })
      observer.observe(document.body, { childList: true, subtree: true })
    })
  }

  /**
   * Waits for a modal containing specific text to appear.
   * @param {string} modalTextStart - The starting text of the modal content.
   * @returns {Promise<Element>} - A promise that resolves when the modal is found.
   */
  function waitForModal(modalTextStart) {
    return new Promise((resolve) => {
      const modal = Array.from(document.querySelectorAll(MODAL_SELECTOR)).find(
        (modal) => modal.textContent.startsWith(modalTextStart)
      )

      if (modal) {
        resolve(modal)
        return
      }

      const observer = new MutationObserver((mutations, obs) => {
        const modal = Array.from(
          document.querySelectorAll(MODAL_SELECTOR)
        ).find((modal) => modal.textContent.startsWith(modalTextStart))

        if (modal) {
          obs.disconnect()
          resolve(modal)
        }
      })
      observer.observe(document.body, { childList: true, subtree: true })
    })
  }

  /**
   * Clicks the "Remove" button in the confirmation modal.
   */
  function clickRemoveButton() {
    const confirmationModal = Array.from(
      document.querySelectorAll(MODAL_SELECTOR)
    ).find((modal) => modal.textContent.startsWith(MODAL_TEXT_START))

    if (confirmationModal) {
      const removeButton = Array.from(
        confirmationModal.querySelectorAll('button')
      ).find((btn) => btn.textContent === REMOVE_BUTTON_TEXT)

      if (removeButton) {
        // Click the remove button
        // removeButton.style.backgroundColor = HIGHLIGHT_COLOR;
        removeButton.click()
        notyf.success('Deleted CRM Sync Note!')
      } else {
        notyf.error("Couldn't find the remove button in the confirmation modal")
        console.error('Remove button not found in confirmation modal')
      }
    } else {
      notyf.error("Couldn't find the confirmation modal")
      console.error('Confirmation modal not found')
    }
  }

  /**
   * Clicks the "Cancel" button in the confirmation modal.
   */
  function clickCancelButton() {
    const confirmationModal = Array.from(
      document.querySelectorAll(MODAL_SELECTOR)
    ).find((modal) => modal.textContent.startsWith(MODAL_TEXT_START))

    if (confirmationModal) {
      const cancelButton = Array.from(
        confirmationModal.querySelectorAll('button')
      ).find((btn) => btn.textContent === 'Cancel')

      if (cancelButton) {
        cancelButton.click()
      } else {
        notyf.error("Couldn't find the cancel button in the confirmation modal")
        console.error('Cancel button not found in confirmation modal')
      }
    } else {
      notyf.error("Couldn't find the confirmation modal")
      console.error('Confirmation modal not found')
    }
  }

  /**
   * Debounce function to limit the rate of function execution.
   * @param {Function} func - The function to debounce.
   * @param {number} wait - The delay time in milliseconds.
   * @returns {Function} - The debounced function.
   */
  function debounce(func, wait) {
    let timeout
    return function (...args) {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }
  }

  /**
   * Checks if there are any CRM Sync Notes and updates the button visibility.
   */
  function updateButtonVisibility() {
    console.log('updateButtonVisibility called')
    deleteButton.style.display = 'none'

    const currentUrl = window.location.href
    console.log('Current URL:', currentUrl)
    if (currentUrl.includes('/contacts/')) {
      console.log("URL includes '/contacts/'")

      // Wait for up to 10 seconds for the feed container to load with at least 2 children
      let feedContainer
      let attempts = 0
      const interval = setInterval(() => {
        attempts++
        console.log(`Attempt ${attempts}: Checking for feed container...`)
        if (attempts >= 10) {
          console.log('Max attempts reached. Stopping interval.')
          clearInterval(interval)
          return
        }
        feedContainer = document.querySelector('.feed-items')
        console.log('Feed container:', feedContainer)
        if (feedContainer?.children.length >= 2) {
          console.log(
            'Feed container has at least 2 children. Showing delete button.'
          )
          deleteButton.style.display = 'block'
          clearInterval(interval)
        }
      }, 1000)
    } else {
      console.log("URL does not include '/contacts/'")
    }
  }

  /**
   * Creates and adds a floating button to the page.
   */
  function addFloatingButton() {
    deleteButton = document.createElement('button')
    deleteButton.textContent = 'Delete CRM Sync Notes'
    deleteButton.style.position = 'fixed'
    deleteButton.style.top = '10px'
    deleteButton.style.left = '50%'
    deleteButton.style.transform = 'translateX(-50%)'
    deleteButton.style.padding = '10px 20px'
    deleteButton.style.backgroundColor = '#007bff'
    deleteButton.style.color = 'white'
    deleteButton.style.border = 'none'
    deleteButton.style.borderRadius = '5px'
    deleteButton.style.cursor = 'pointer'
    deleteButton.style.zIndex = '9999'
    deleteButton.style.fontSize = '14px'
    deleteButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'

    deleteButton.addEventListener('mouseover', () => {
      deleteButton.style.backgroundColor = '#0056b3'
    })

    deleteButton.addEventListener('mouseout', () => {
      deleteButton.style.backgroundColor = '#007bff'
    })

    deleteButton.addEventListener('click', () => {
      if (
        window.confirm('Are you sure you want to delete all CRM Sync Notes?')
      ) {
        main()
      }
    })

    document.body.appendChild(deleteButton)
  }

  /**
   * Monitors URL changes and triggers actions accordingly.
   */
  function hookIntoUrlChanges() {
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    function handleUrlChange() {
      updateButtonVisibility()
    }

    history.pushState = function (...args) {
      originalPushState.apply(this, args)
      handleUrlChange()
    }

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args)
      handleUrlChange()
    }

    window.addEventListener('popstate', handleUrlChange)
    handleUrlChange() // Initial check when the script loads
  }

  // Load the Notyf library, add the floating button, hook into URL changes, and set initial visibility
  addFloatingButton()
  hookIntoUrlChanges()
})()
