/**
 * Tejas Candid Photography - Quotation & Billing Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // PRICING CONSTANTS
    // -------------------------------------------------------------
    const RATES = {
        traditional: 10000, // per day (Traditional Photography + Videography)
        candid: 6000,       // per day (Candid Photography)
        cinematic: 15000,   // per day (Cinematic Videography)
        albumSheetRate: 500, // per sheet (Album: 500rs x 30sheet = 15000)
        miniPackage: 9999    // 9999 package: 10 photo + 2 reel / 1 highlight + 1 reel
    };

    // -------------------------------------------------------------
    // STATE - Clean without prefilled hardcoded client data
    // -------------------------------------------------------------
    const state = {
        mode: 'custom', // 'fixed' or 'custom'
        selectedFixedPackage: null,
        client: {
            name: '',
            phone: '',
            eventType: 'Wedding & Reception',
            eventDate: '',
            venue: '',
            quoteNo: generateQuoteNo(), // Timestamp-based unique reference
            quoteDate: getTodayFormatted()
        },
        services: {
            traditional: {
                selected: false,
                days: 1,
                rate: RATES.traditional
            },
            candid: {
                selected: false,
                days: 1,
                rate: RATES.candid
            },
            cinematic: {
                selected: false,
                days: 1,
                rate: RATES.cinematic
            },
            album: {
                selected: false,
                sheets: 30,
                ratePerSheet: RATES.albumSheetRate
            },
            miniEvent: {
                selected: false,
                variant: '10 Photos + 2 Reels' // or '10 Photos + 1 Highlight + 1 Reel'
            }
        },
        customItems: [],
        complimentary: {
            pendrive: true,
            minibook: true,
            photoframe: true,
            calendar: true,
            bagbox: true,
            reels: true,
            highlight: true
        },
        financials: {
            discount: 0,
            advance: 0
        }
    };

    // -------------------------------------------------------------
    // DOM REFERENCES
    // -------------------------------------------------------------
    const tabBtns = document.querySelectorAll('.quote-mode-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Client Input DOM
    const inputClientName = document.getElementById('inputClientName');
    const inputClientPhone = document.getElementById('inputClientPhone');
    const inputEventType = document.getElementById('inputEventType');
    const inputEventDate = document.getElementById('inputEventDate');
    const inputEventVenue = document.getElementById('inputEventVenue');
    const inputQuoteNo = document.getElementById('inputQuoteNo');
    const inputQuoteDate = document.getElementById('inputQuoteDate');

    // Service Controls DOM
    const chkTraditional = document.getElementById('chkTraditional');
    const qtyTraditional = document.getElementById('qtyTraditional');
    const minusTraditional = document.getElementById('minusTraditional');
    const plusTraditional = document.getElementById('plusTraditional');

    const chkCandid = document.getElementById('chkCandid');
    const qtyCandid = document.getElementById('qtyCandid');
    const minusCandid = document.getElementById('minusCandid');
    const plusCandid = document.getElementById('plusCandid');

    const chkCinematic = document.getElementById('chkCinematic');
    const qtyCinematic = document.getElementById('qtyCinematic');
    const minusCinematic = document.getElementById('minusCinematic');
    const plusCinematic = document.getElementById('plusCinematic');

    const chkAlbum = document.getElementById('chkAlbum');
    const rangeAlbumSheets = document.getElementById('rangeAlbumSheets');
    const displayAlbumSheets = document.getElementById('displayAlbumSheets');
    const displayAlbumTotal = document.getElementById('displayAlbumTotal');

    const chkMiniEvent = document.getElementById('chkMiniEvent');
    const selectMiniVariant = document.getElementById('selectMiniVariant');

    // Complimentary Checkboxes
    const complimentaryCheckboxes = document.querySelectorAll('.freebie-chk');
    const btnSelectAllComplimentary = document.getElementById('btnSelectAllComplimentary');

    // Financial Inputs
    const inputDiscount = document.getElementById('inputDiscount');
    const inputAdvance = document.getElementById('inputAdvance');

    // Custom items
    const customItemsContainer = document.getElementById('customItemsContainer');
    const btnAddCustomItem = document.getElementById('btnAddCustomItem');

    // Bill & Action Buttons
    const billWrapper = document.getElementById('printableBill');
    const btnPrintBill = document.getElementById('btnPrintBill');
    const btnDownloadPDF = document.getElementById('btnDownloadPDF');
    const btnDownloadImage = document.getElementById('btnDownloadImage');
    const btnShareWhatsApp = document.getElementById('btnShareWhatsApp');
    const btnShareWhatsAppToolbar = document.getElementById('btnShareWhatsAppToolbar');
    const btnCopyQuote = document.getElementById('btnCopyQuote');
    const btnResetQuote = document.getElementById('btnResetQuote');
    const btnCloseBill = document.getElementById('btnCloseBill');
    const btnScrollToBill = document.getElementById('btnScrollToBill');

    // -------------------------------------------------------------
    // INITIALIZATION
    // -------------------------------------------------------------
    initDefaults();
    bindEvents();
    renderAll();

    function initDefaults() {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        state.client.quoteDate = todayStr;
        state.client.quoteNo = generateQuoteNo(); // Fresh timestamp
        state.client.eventDate = '';
        state.client.name = '';
        state.client.phone = '';
        state.client.venue = '';

        if (inputQuoteDate) {
            inputQuoteDate.value = state.client.quoteDate;
            inputQuoteDate.min = todayStr;
        }
        if (inputEventDate) {
            inputEventDate.value = '';
            inputEventDate.min = todayStr; // Disallow selecting past dates
        }
        if (inputQuoteNo) inputQuoteNo.value = state.client.quoteNo;
        if (inputClientName) inputClientName.value = '';
        if (inputClientPhone) inputClientPhone.value = '';
        if (inputEventType) inputEventType.value = 'Wedding & Reception';
        if (inputEventVenue) inputEventVenue.value = '';
        if (inputDiscount) inputDiscount.value = '';
        if (inputAdvance) inputAdvance.value = '';

        syncControlsFromState();
    }

    // Helper to reveal the bill sheet
    function showBillSheet(scrollIntoView = true) {
        if (billWrapper) {
            billWrapper.classList.add('visible');
            if (scrollIntoView) {
                setTimeout(() => {
                    billWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 80);
            }
        }
    }

    function hideBillSheet() {
        if (billWrapper) {
            billWrapper.classList.remove('visible');
        }
    }

    // Switch view to Custom Calculator tab
    function switchToCustomTab() {
        tabBtns.forEach(btn => {
            if (btn.dataset.tab === 'tab-custom') btn.classList.add('active');
            else btn.classList.remove('active');
        });
        tabPanes.forEach(pane => {
            if (pane.id === 'tab-custom') pane.classList.add('active');
            else pane.classList.remove('active');
        });
        state.mode = 'custom';
    }

    // Validation: Require Client Name & Contact before showing/printing bill
    function validateClientInfo() {
        const nameVal = inputClientName ? inputClientName.value.trim() : state.client.name.trim();
        const phoneVal = inputClientPhone ? inputClientPhone.value.trim() : state.client.phone.trim();

        if (!nameVal) {
            showToast('⚠️ Please enter the Client / Couple Name first.');
            highlightField(inputClientName);
            return false;
        }

        if (!phoneVal) {
            showToast('⚠️ Please enter the WhatsApp / Mobile Number first.');
            highlightField(inputClientPhone);
            return false;
        }

        // Validate date is not in the past
        const todayStr = getTodayFormatted();
        if (state.client.eventDate && state.client.eventDate < todayStr) {
            showToast('⚠️ Event date cannot be in the past. Only today and future dates are allowed.');
            highlightField(inputEventDate);
            return false;
        }

        return true;
    }

    function highlightField(fieldEl) {
        if (!fieldEl) return;
        // Make sure custom tab is active so field is visible
        switchToCustomTab();
        fieldEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        fieldEl.focus();

        fieldEl.style.transition = 'all 0.3s ease';
        fieldEl.style.borderColor = '#e53e3e';
        fieldEl.style.boxShadow = '0 0 0 4px rgba(229, 62, 62, 0.25)';
        fieldEl.style.backgroundColor = '#fff5f5';

        setTimeout(() => {
            fieldEl.style.borderColor = '';
            fieldEl.style.boxShadow = '';
            fieldEl.style.backgroundColor = '';
        }, 3000);
    }

    // -------------------------------------------------------------
    // EVENT BINDINGS
    // -------------------------------------------------------------
    function bindEvents() {
        // Tab Switcher
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.tab;
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                const targetPane = document.getElementById(target);
                if (targetPane) targetPane.classList.add('active');
                state.mode = target === 'tab-custom' ? 'custom' : 'fixed';
            });
        });

        // Fixed Package Buttons -> Load values into custom calculator, switch tab, prompt for client details
        document.querySelectorAll('.btn-select-pkg').forEach(btn => {
            btn.addEventListener('click', () => {
                const pkgKey = btn.dataset.package;
                applyFixedPackage(pkgKey);
            });
        });

        // Client Inputs
        if (inputClientName) inputClientName.addEventListener('input', e => { state.client.name = e.target.value.trim(); renderBill(); });
        if (inputClientPhone) {
            inputClientPhone.addEventListener('keydown', e => {
                // Allow control keys (backspace, delete, tab, arrows, enter, copy/paste/select shortcuts)
                if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(e.key) ||
                    (e.ctrlKey || e.metaKey)) {
                    return;
                }
                // Disallow anything other than digits 0-9
                if (!/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                }
            });

            inputClientPhone.addEventListener('input', e => {
                // Strip all non-digit characters and limit to 10 digits
                const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                e.target.value = digits;
                state.client.phone = digits;
                renderBill();
            });

            inputClientPhone.addEventListener('paste', e => {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text');
                const clean = paste.replace(/\D/g, '').slice(0, 10);
                inputClientPhone.value = clean;
                state.client.phone = clean;
                renderBill();
            });
        }
        if (inputEventType) inputEventType.addEventListener('change', e => { state.client.eventType = e.target.value; renderBill(); });
        if (inputEventDate) {
            inputEventDate.addEventListener('change', e => {
                const todayStr = getTodayFormatted();
                if (e.target.value && e.target.value < todayStr) {
                    showToast('⚠️ Past dates are not allowed. Only today and future dates are accepted.');
                    e.target.value = '';
                    state.client.eventDate = '';
                    highlightField(inputEventDate);
                } else {
                    state.client.eventDate = e.target.value;
                }
                renderBill();
            });
            inputEventDate.addEventListener('input', e => {
                const todayStr = getTodayFormatted();
                if (e.target.value && e.target.value >= todayStr) {
                    state.client.eventDate = e.target.value;
                    renderBill();
                }
            });
        }
        if (inputEventVenue) inputEventVenue.addEventListener('input', e => { state.client.venue = e.target.value.trim(); renderBill(); });
        if (inputQuoteNo) inputQuoteNo.addEventListener('input', e => { state.client.quoteNo = e.target.value.trim(); renderBill(); });
        if (inputQuoteDate) inputQuoteDate.addEventListener('input', e => { state.client.quoteDate = e.target.value; renderBill(); });

        // Traditional Service
        if (chkTraditional) chkTraditional.addEventListener('change', e => {
            state.services.traditional.selected = e.target.checked;
            toggleServiceCardActive('serviceCardTraditional', e.target.checked);
            renderAll();
        });
        if (minusTraditional) minusTraditional.addEventListener('click', () => {
            if (state.services.traditional.days > 1) {
                state.services.traditional.days--;
                renderAll();
            }
        });
        if (plusTraditional) plusTraditional.addEventListener('click', () => {
            state.services.traditional.days++;
            renderAll();
        });

        // Candid Service
        if (chkCandid) chkCandid.addEventListener('change', e => {
            state.services.candid.selected = e.target.checked;
            toggleServiceCardActive('serviceCardCandid', e.target.checked);
            renderAll();
        });
        if (minusCandid) minusCandid.addEventListener('click', () => {
            if (state.services.candid.days > 1) {
                state.services.candid.days--;
                renderAll();
            }
        });
        if (plusCandid) plusCandid.addEventListener('click', () => {
            state.services.candid.days++;
            renderAll();
        });

        // Cinematic Service
        if (chkCinematic) chkCinematic.addEventListener('change', e => {
            state.services.cinematic.selected = e.target.checked;
            toggleServiceCardActive('serviceCardCinematic', e.target.checked);
            renderAll();
        });
        if (minusCinematic) minusCinematic.addEventListener('click', () => {
            if (state.services.cinematic.days > 1) {
                state.services.cinematic.days--;
                renderAll();
            }
        });
        if (plusCinematic) plusCinematic.addEventListener('click', () => {
            state.services.cinematic.days++;
            renderAll();
        });

        // Album Service
        if (chkAlbum) chkAlbum.addEventListener('change', e => {
            state.services.album.selected = e.target.checked;
            toggleServiceCardActive('serviceCardAlbum', e.target.checked);
            renderAll();
        });
        if (rangeAlbumSheets) rangeAlbumSheets.addEventListener('input', e => {
            state.services.album.sheets = parseInt(e.target.value, 10);
            renderAll();
        });

        // Mini Event (9999 package)
        if (chkMiniEvent) chkMiniEvent.addEventListener('change', e => {
            state.services.miniEvent.selected = e.target.checked;
            toggleServiceCardActive('serviceCardMini', e.target.checked);
            renderAll();
        });
        if (selectMiniVariant) selectMiniVariant.addEventListener('change', e => {
            state.services.miniEvent.variant = e.target.value;
            renderAll();
        });

        // Complimentary Checkboxes
        complimentaryCheckboxes.forEach(chk => {
            chk.addEventListener('change', () => {
                const key = chk.dataset.key;
                if (key) state.complimentary[key] = chk.checked;
                renderAll();
            });
        });

        if (btnSelectAllComplimentary) {
            btnSelectAllComplimentary.addEventListener('click', () => {
                const allSelected = Object.values(state.complimentary).every(v => v);
                const nextState = !allSelected;
                Object.keys(state.complimentary).forEach(k => state.complimentary[k] = nextState);
                complimentaryCheckboxes.forEach(chk => chk.checked = nextState);
                btnSelectAllComplimentary.textContent = nextState ? 'Deselect All' : 'Select All';
                renderAll();
            });
        }

        // Financials
        if (inputDiscount) inputDiscount.addEventListener('input', e => {
            state.financials.discount = Math.max(0, parseFloat(e.target.value) || 0);
            renderAll();
        });
        if (inputAdvance) inputAdvance.addEventListener('input', e => {
            state.financials.advance = Math.max(0, parseFloat(e.target.value) || 0);
            renderAll();
        });

        // Add Custom Item
        if (btnAddCustomItem) {
            btnAddCustomItem.addEventListener('click', () => {
                const itemId = Date.now();
                state.customItems.push({
                    id: itemId,
                    name: 'Extra Drone Cinematography',
                    rate: 5000,
                    qty: 1
                });
                renderCustomItemRows();
                renderAll();
            });
        }

        // Show/Hide Bill Sheet Actions (with Client Info Validation)
        if (btnScrollToBill) {
            btnScrollToBill.addEventListener('click', () => {
                if (!validateClientInfo()) {
                    return;
                }
                showBillSheet(true);
            });
        }

        if (btnCloseBill) {
            btnCloseBill.addEventListener('click', () => {
                hideBillSheet();
            });
        }

        // Share Clean Text Quote on WhatsApp (Sidebar button)
        if (btnShareWhatsApp) {
            btnShareWhatsApp.addEventListener('click', () => {
                shareQuotationOnWhatsApp();
            });
        }

        // Share Clean Text Quote on WhatsApp (Toolbar button)
        if (btnShareWhatsAppToolbar) {
            btnShareWhatsAppToolbar.addEventListener('click', () => {
                shareQuotationOnWhatsApp();
            });
        }

        // Print Bill / Native Save as PDF
        if (btnPrintBill) {
            btnPrintBill.addEventListener('click', () => {
                if (!validateClientInfo()) {
                    return;
                }
                showBillSheet(false);
                window.print();
            });
        }

        // Copy Quote Text (with Client Info Validation)
        if (btnCopyQuote) {
            btnCopyQuote.addEventListener('click', () => {
                if (!validateClientInfo()) {
                    return;
                }
                copyQuotationText();
            });
        }

        // Reset All
        if (btnResetQuote) {
            btnResetQuote.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all fields?')) {
                    resetToDefaults();
                }
            });
        }
    }

    function toggleServiceCardActive(cardId, isActive) {
        const card = document.getElementById(cardId);
        if (card) {
            if (isActive) card.classList.add('selected');
            else card.classList.remove('selected');
        }
    }

    // -------------------------------------------------------------
    // APPLY FIXED PACKAGES
    // -------------------------------------------------------------
    function applyFixedPackage(pkgKey) {
        state.selectedFixedPackage = pkgKey;

        if (pkgKey === 'mini-9999') {
            state.services.traditional.selected = false;
            state.services.candid.selected = false;
            state.services.cinematic.selected = false;
            state.services.album.selected = false;
            state.services.miniEvent.selected = true;
            state.services.miniEvent.variant = '10 Photos + 2 Reels';

            state.complimentary.pendrive = true;
            state.complimentary.reels = true;
            state.complimentary.highlight = true;
            state.complimentary.minibook = false;
            state.complimentary.photoframe = false;
            state.complimentary.calendar = false;
            state.complimentary.bagbox = false;

            state.financials.advance = 3000;
            state.financials.discount = 0;
        } else if (pkgKey === 'wedding-grand') {
            state.services.traditional.selected = true;
            state.services.traditional.days = 1;

            state.services.candid.selected = true;
            state.services.candid.days = 1;

            state.services.cinematic.selected = true;
            state.services.cinematic.days = 1;

            state.services.album.selected = true;
            state.services.album.sheets = 30;

            state.services.miniEvent.selected = false;

            Object.keys(state.complimentary).forEach(k => state.complimentary[k] = true);

            state.financials.advance = 10000;
            state.financials.discount = 0;
        } else if (pkgKey === 'traditional-classic') {
            state.services.traditional.selected = true;
            state.services.traditional.days = 1;

            state.services.album.selected = true;
            state.services.album.sheets = 30;

            state.services.candid.selected = false;
            state.services.cinematic.selected = false;
            state.services.miniEvent.selected = false;

            state.complimentary.pendrive = true;
            state.complimentary.minibook = true;
            state.complimentary.calendar = true;
            state.complimentary.bagbox = true;
            state.complimentary.photoframe = false;
            state.complimentary.reels = false;
            state.complimentary.highlight = false;

            state.financials.advance = 5000;
            state.financials.discount = 0;
        }

        // 1. Sync controls & recalculate
        syncControlsFromState();
        renderAll();

        // 2. Hide the bill sheet until details are entered
        hideBillSheet();

        // 3. Navigate to the Custom Calculator tab with values filled
        switchToCustomTab();

        // 4. Scroll to Client Name & highlight it
        setTimeout(() => {
            if (inputClientName) {
                inputClientName.scrollIntoView({ behavior: 'smooth', block: 'center' });
                inputClientName.focus();
            }
        }, 120);

        // 5. Notify the user to enter their name & contact details
        showToast('✨ Package selected! Please enter Client Name & WhatsApp number above to generate your bill.');
    }

    function syncControlsFromState() {
        if (chkTraditional) chkTraditional.checked = state.services.traditional.selected;
        if (qtyTraditional) qtyTraditional.textContent = `${state.services.traditional.days} Day${state.services.traditional.days > 1 ? 's' : ''}`;
        toggleServiceCardActive('serviceCardTraditional', state.services.traditional.selected);

        if (chkCandid) chkCandid.checked = state.services.candid.selected;
        if (qtyCandid) qtyCandid.textContent = `${state.services.candid.days} Day${state.services.candid.days > 1 ? 's' : ''}`;
        toggleServiceCardActive('serviceCardCandid', state.services.candid.selected);

        if (chkCinematic) chkCinematic.checked = state.services.cinematic.selected;
        if (qtyCinematic) qtyCinematic.textContent = `${state.services.cinematic.days} Day${state.services.cinematic.days > 1 ? 's' : ''}`;
        toggleServiceCardActive('serviceCardCinematic', state.services.cinematic.selected);

        if (chkAlbum) chkAlbum.checked = state.services.album.selected;
        if (rangeAlbumSheets) rangeAlbumSheets.value = state.services.album.sheets;
        if (displayAlbumSheets) displayAlbumSheets.textContent = `${state.services.album.sheets} Sheets`;
        toggleServiceCardActive('serviceCardAlbum', state.services.album.selected);

        if (chkMiniEvent) chkMiniEvent.checked = state.services.miniEvent.selected;
        if (selectMiniVariant) selectMiniVariant.value = state.services.miniEvent.variant;
        toggleServiceCardActive('serviceCardMini', state.services.miniEvent.selected);

        complimentaryCheckboxes.forEach(chk => {
            const key = chk.dataset.key;
            if (key) chk.checked = !!state.complimentary[key];
        });

        if (inputDiscount) inputDiscount.value = state.financials.discount || '';
        if (inputAdvance) inputAdvance.value = state.financials.advance || '';
    }

    // -------------------------------------------------------------
    // RENDER CALCULATIONS & BILL
    // -------------------------------------------------------------
    function calculateTotals() {
        let subtotal = 0;
        const lineItems = [];

        // 1. Traditional
        if (state.services.traditional.selected) {
            const amt = state.services.traditional.days * state.services.traditional.rate;
            subtotal += amt;
            lineItems.push({
                title: 'Traditional Photography + Videography',
                sub: 'Full day traditional multi-angle video & photo coverage with lighting setup',
                qty: `${state.services.traditional.days} Day(s)`,
                rate: state.services.traditional.rate,
                amount: amt
            });
        }

        // 2. Candid
        if (state.services.candid.selected) {
            const amt = state.services.candid.days * state.services.candid.rate;
            subtotal += amt;
            lineItems.push({
                title: 'Candid Photography',
                sub: 'Artistic candid portraiture capturing emotional & spontaneous moments',
                qty: `${state.services.candid.days} Day(s)`,
                rate: state.services.candid.rate,
                amount: amt
            });
        }

        // 3. Cinematic Videography
        if (state.services.cinematic.selected) {
            const amt = state.services.cinematic.days * state.services.cinematic.rate;
            subtotal += amt;
            lineItems.push({
                title: 'Cinematic Videography',
                sub: 'Gimbal stabilized 4K cinematic film, creative perspectives & teaser reels',
                qty: `${state.services.cinematic.days} Day(s)`,
                rate: state.services.cinematic.rate,
                amount: amt
            });
        }

        // 4. Album
        if (state.services.album.selected) {
            const amt = state.services.album.sheets * state.services.album.ratePerSheet;
            subtotal += amt;
            lineItems.push({
                title: `Premium Photobook Album (${state.services.album.sheets} Sheets / ${state.services.album.sheets * 2} Pages)`,
                sub: `₹${state.services.album.ratePerSheet} per sheet (Luster / Velvet finish with protective coating & custom cover)`,
                qty: `${state.services.album.sheets} Sheets`,
                rate: state.services.album.ratePerSheet,
                amount: amt
            });
        }

        // 5. Mini Event (9999 package)
        if (state.services.miniEvent.selected) {
            subtotal += RATES.miniPackage;
            lineItems.push({
                title: `Special Mini-Event Package (₹9,999)`,
                sub: `Includes 10 Edited Photos + ${state.services.miniEvent.variant}`,
                qty: '1 Package',
                rate: RATES.miniPackage,
                amount: RATES.miniPackage
            });
        }

        // 6. Custom items
        state.customItems.forEach(item => {
            const amt = (item.rate || 0) * (item.qty || 1);
            subtotal += amt;
            lineItems.push({
                title: item.name || 'Additional Service',
                sub: 'Customized client requirement',
                qty: `${item.qty || 1} Unit(s)`,
                rate: item.rate || 0,
                amount: amt
            });
        });

        const discount = Math.min(subtotal, state.financials.discount || 0);
        const finalTotal = Math.max(0, subtotal - discount);
        const advance = Math.min(finalTotal, state.financials.advance || 0);
        const balance = Math.max(0, finalTotal - advance);

        return {
            subtotal,
            discount,
            finalTotal,
            advance,
            balance,
            lineItems
        };
    }

    function renderAll() {
        const totals = calculateTotals();

        // Update inputs & display counters
        if (qtyTraditional) qtyTraditional.textContent = `${state.services.traditional.days} Day${state.services.traditional.days > 1 ? 's' : ''}`;
        if (qtyCandid) qtyCandid.textContent = `${state.services.candid.days} Day${state.services.candid.days > 1 ? 's' : ''}`;
        if (qtyCinematic) qtyCinematic.textContent = `${state.services.cinematic.days} Day${state.services.cinematic.days > 1 ? 's' : ''}`;
        
        if (displayAlbumSheets) displayAlbumSheets.textContent = `${state.services.album.sheets} Sheets`;
        if (displayAlbumTotal) {
            const albumCost = state.services.album.sheets * state.services.album.ratePerSheet;
            displayAlbumTotal.textContent = `₹${albumCost.toLocaleString('en-IN')}`;
        }

        // Update Live Sticky Summary Card
        renderSideSummary(totals);

        // Update Printable Official Bill
        renderBill(totals);

        // Update WhatsApp share link
        updateWhatsAppLink(totals);
    }

    function renderSideSummary(totals) {
        const listElem = document.getElementById('summaryItemsList');
        const subtotalElem = document.getElementById('summarySubtotal');
        const discountRowElem = document.getElementById('summaryDiscountRow');
        const discountElem = document.getElementById('summaryDiscount');
        const totalElem = document.getElementById('summaryFinalTotal');
        const advanceElem = document.getElementById('summaryAdvance');
        const balanceElem = document.getElementById('summaryBalance');

        if (!listElem) return;

        let html = '';
        if (totals.lineItems.length === 0) {
            html = '<div style="color: #777; font-size: 13px; text-align: center; padding: 20px 0;">No services selected. Choose from above or pick a package.</div>';
        } else {
            totals.lineItems.forEach(item => {
                html += `
                    <div class="summary-row">
                        <span>${escapeHtml(item.title)}</span>
                        <span class="amount">₹${item.amount.toLocaleString('en-IN')}</span>
                    </div>
                `;
            });
        }

        // Complimentary items list in summary
        const activePerks = getActiveComplimentaryNames();
        if (activePerks.length > 0 && totals.lineItems.length > 0) {
            html += `
                <div class="summary-row free-perk">
                    <span>🎁 ${activePerks.length} Complimentary Perks Included</span>
                    <span class="amount">FREE</span>
                </div>
            `;
        }

        listElem.innerHTML = html;

        if (subtotalElem) subtotalElem.textContent = `₹${totals.subtotal.toLocaleString('en-IN')}`;

        if (discountRowElem && discountElem) {
            if (totals.discount > 0) {
                discountRowElem.style.display = 'flex';
                discountElem.textContent = `-₹${totals.discount.toLocaleString('en-IN')}`;
            } else {
                discountRowElem.style.display = 'none';
            }
        }

        if (totalElem) totalElem.textContent = `₹${totals.finalTotal.toLocaleString('en-IN')}`;
        if (advanceElem) advanceElem.textContent = `₹${totals.advance.toLocaleString('en-IN')}`;
        if (balanceElem) balanceElem.textContent = `₹${totals.balance.toLocaleString('en-IN')}`;
    }

    function renderBill(totals) {
        if (!totals) totals = calculateTotals();

        // Bill Meta
        setText('billQuoteNo', state.client.quoteNo || generateQuoteNo());
        setText('billQuoteDate', formatDateDisplay(state.client.quoteDate));
        
        // Client details - show clean fallback if empty
        setText('billClientName', state.client.name || '—');
        setText('billClientPhone', state.client.phone || '—');
        setText('billEventType', state.client.eventType || '—');
        setText('billEventDate', state.client.eventDate ? formatDateDisplay(state.client.eventDate) : 'To be confirmed');
        setText('billEventVenue', state.client.venue || '—');

        // Table Rows
        const tbody = document.getElementById('billTableBody');
        if (tbody) {
            if (totals.lineItems.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 24px; color: #888;">
                            No services selected yet. Please select services above or choose a package.
                        </td>
                    </tr>
                `;
            } else {
                let rowsHtml = '';
                totals.lineItems.forEach((item, index) => {
                    rowsHtml += `
                        <tr>
                            <td class="text-center" style="font-weight: 600;">${index + 1}</td>
                            <td>
                                <div class="invoice-item-title">${escapeHtml(item.title)}</div>
                                <div class="invoice-item-sub">${escapeHtml(item.sub)}</div>
                            </td>
                            <td class="text-center">${escapeHtml(item.qty)}</td>
                            <td class="text-right">₹${item.rate.toLocaleString('en-IN')}</td>
                            <td class="text-right" style="font-weight: 700;">₹${item.amount.toLocaleString('en-IN')}</td>
                        </tr>
                    `;
                });
                tbody.innerHTML = rowsHtml;
            }
        }

        // Complimentary Banner on Bill
        const bannerContainer = document.getElementById('billComplimentaryContainer');
        const perks = getActiveComplimentaryNames();
        if (bannerContainer) {
            if (perks.length > 0 && totals.lineItems.length > 0) {
                let perksListHtml = '';
                perks.forEach(perk => {
                    perksListHtml += `
                        <li>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ${escapeHtml(perk)} <span style="font-size: 9px; background: #e0f6e5; color: #0b7c29; padding: 1px 5px; border-radius: 3px; font-weight: 700; margin-left: 2px;">FREE (₹0)</span>
                        </li>
                    `;
                });

                bannerContainer.innerHTML = `
                    <div class="bill-complimentary-banner">
                        <h5>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                            Special Complimentary Gifts Included with this Package
                        </h5>
                        <ul class="bill-perks-list">
                            ${perksListHtml}
                        </ul>
                    </div>
                `;
                bannerContainer.style.display = 'block';
            } else {
                bannerContainer.style.display = 'none';
            }
        }

        // Totals on Bill
        setText('billSubtotal', `₹${totals.subtotal.toLocaleString('en-IN')}`);

        const billDiscountRow = document.getElementById('billDiscountRow');
        if (billDiscountRow) {
            if (totals.discount > 0) {
                billDiscountRow.style.display = 'table-row';
                setText('billDiscount', `-₹${totals.discount.toLocaleString('en-IN')}`);
            } else {
                billDiscountRow.style.display = 'none';
            }
        }

        setText('billFinalTotal', `₹${totals.finalTotal.toLocaleString('en-IN')}`);
        setText('billAdvance', `₹${totals.advance.toLocaleString('en-IN')}`);
        setText('billBalance', `₹${totals.balance.toLocaleString('en-IN')}`);

        // In words
        const wordsElem = document.getElementById('billAmountInWords');
        if (wordsElem) {
            wordsElem.textContent = numberToWords(totals.finalTotal);
        }
    }

    function getActiveComplimentaryNames() {
        const labels = {
            pendrive: 'High-Speed Pendrive (Raw & Edited Data)',
            minibook: 'Minibook Album (Pocket Edition)',
            photoframe: '20×30 Premium Photo Frame',
            calendar: 'Personalized Table Calendar',
            bagbox: 'Bag + Box (Luxury Studio Presentation)',
            reels: '2 Social Media Reels (Ready for Instagram)',
            highlight: 'Cinematic Teaser / Highlight Film'
        };

        const active = [];
        for (const [key, isChecked] of Object.entries(state.complimentary)) {
            if (isChecked && labels[key]) {
                active.push(labels[key]);
            }
        }
        return active;
    }

    // -------------------------------------------------------------
    // CUSTOM ITEMS MANAGEMENT
    // -------------------------------------------------------------
    function renderCustomItemRows() {
        if (!customItemsContainer) return;

        if (state.customItems.length === 0) {
            customItemsContainer.innerHTML = '';
            return;
        }

        let html = '';
        state.customItems.forEach(item => {
            html += `
                <div class="form-row" style="background: #fdfdfd; padding: 12px; border: 1px solid #e5e5e5; border-radius: 10px; align-items: center; margin-bottom: 10px;">
                    <div>
                        <label class="input-label" style="font-size: 11px;">Service Name</label>
                        <input type="text" class="input-field custom-item-name" data-id="${item.id}" value="${escapeHtml(item.name)}" placeholder="e.g. Drone Shoot, LED Wall">
                    </div>
                    <div style="display: flex; gap: 8px; align-items: flex-end;">
                        <div style="flex: 1;">
                            <label class="input-label" style="font-size: 11px;">Amount (₹)</label>
                            <input type="number" class="input-field custom-item-rate" data-id="${item.id}" value="${item.rate}" placeholder="Amount in ₹">
                        </div>
                        <button type="button" class="btn-action btn-reset btn-remove-custom" data-id="${item.id}" style="padding: 10px 14px; height: 44px;" title="Remove Item">✕</button>
                    </div>
                </div>
            `;
        });

        customItemsContainer.innerHTML = html;

        // Bind custom item input listeners
        customItemsContainer.querySelectorAll('.custom-item-name').forEach(inp => {
            inp.addEventListener('input', e => {
                const id = parseInt(e.target.dataset.id, 10);
                const found = state.customItems.find(i => i.id === id);
                if (found) {
                    found.name = e.target.value;
                    renderAll();
                }
            });
        });

        customItemsContainer.querySelectorAll('.custom-item-rate').forEach(inp => {
            inp.addEventListener('input', e => {
                const id = parseInt(e.target.dataset.id, 10);
                const found = state.customItems.find(i => i.id === id);
                if (found) {
                    found.rate = parseFloat(e.target.value) || 0;
                    renderAll();
                }
            });
        });

        customItemsContainer.querySelectorAll('.btn-remove-custom').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = parseInt(btn.dataset.id, 10);
                state.customItems = state.customItems.filter(i => i.id !== id);
                renderCustomItemRows();
                renderAll();
            });
        });
    }

    // -------------------------------------------------------------
    // WHATSAPP & COPY QUOTE GENERATORS
    // -------------------------------------------------------------
    function generateQuoteMessageText(totals) {
        if (!totals) totals = calculateTotals();

        const perks = getActiveComplimentaryNames();
        let message = `*TEJAS CANDID PHOTOGRAPHY*\n`;
        message += `Artistic & Candid Wedding Photography\n`;
        message += `Phone: +91 8459660254 | Web: www.tejascandid.online\n`;
        message += `-------------------------------------\n`;
        message += `*QUOTATION / ESTIMATE*\n`;
        message += `-------------------------------------\n`;
        message += `Client: ${state.client.name || 'Valued Client'}\n`;
        message += `Event: ${state.client.eventType || 'Event'}\n`;
        if (state.client.eventDate) message += `Date: ${formatDateDisplay(state.client.eventDate)}\n`;
        if (state.client.venue) message += `Location: ${state.client.venue}\n`;
        message += `Quote Ref: ${state.client.quoteNo}\n\n`;

        message += `*SELECTED SERVICES & RATES:*\n`;
        if (totals.lineItems.length === 0) {
            message += `No services selected yet.\n`;
        } else {
            totals.lineItems.forEach((item, idx) => {
                message += `${idx + 1}. *${item.title}*\n   Qty: ${item.qty} - Rs. ${item.amount.toLocaleString('en-IN')}\n`;
            });
        }
        message += `\n`;

        if (perks.length > 0 && totals.lineItems.length > 0) {
            message += `*COMPLIMENTARY GIFTS INCLUDED (FREE):*\n`;
            perks.forEach(p => {
                message += `- ${p} (FREE)\n`;
            });
            message += `\n`;
        }

        message += `-------------------------------------\n`;
        message += `Subtotal: Rs. ${totals.subtotal.toLocaleString('en-IN')}\n`;
        if (totals.discount > 0) {
            message += `Special Discount: -Rs. ${totals.discount.toLocaleString('en-IN')}\n`;
        }
        message += `*Total Package Amount: Rs. ${totals.finalTotal.toLocaleString('en-IN')}*\n`;
        message += `Advance Payable: Rs. ${totals.advance.toLocaleString('en-IN')}\n`;
        message += `Estimated Balance Due: Rs. ${totals.balance.toLocaleString('en-IN')}\n`;
        message += `-------------------------------------\n\n`;

        message += `*Booking Terms:*\n`;
        message += `- Advance booking required to reserve date on calendar.\n`;
        message += `- 50% payable on event day, balance upon photobook design approval.\n`;
        message += `- Raw data and high-res edited soft copies within 15-20 working days.\n\n`;
        message += `Thank you for considering Tejas Candid Photography!`;

        return message;
    }

    function shareQuotationOnWhatsApp() {
        if (!validateClientInfo()) return;

        let phoneParam = '918459660254';
        const clientPhoneDigits = (state.client.phone || '').replace(/\D/g, '');
        if (clientPhoneDigits.length >= 10) {
            phoneParam = clientPhoneDigits.startsWith('91') ? clientPhoneDigits : `91${clientPhoneDigits}`;
        }

        const messageText = generateQuoteMessageText();
        const encodedText = encodeURIComponent(messageText);

        showToast('💬 Opening WhatsApp with clean quotation text...');
        window.open(`https://wa.me/${phoneParam}?text=${encodedText}`, '_blank');
    }

    // -------------------------------------------------------------
    // -------------------------------------------------------------
    // -------------------------------------------------------------
    // INVOICE IMAGE & 1-PAGE PDF GENERATION VIA HTML2CANVAS + JSPDF
    // -------------------------------------------------------------

    /**
     * Renders #invoicePaper into a pixel-crisp canvas using html2canvas
     */
    function generateInvoiceCanvas(callback) {
        if (!validateClientInfo()) return;

        // Ensure bill sheet is rendered and visible in DOM
        renderBill();
        showBillSheet(false);

        const element = document.getElementById('invoicePaper');
        if (!element) return;

        const quoteNo = state.client.quoteNo || 'Quote';
        const clientSlug = (state.client.name || 'Client').replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `Tejas_Candid_${clientSlug}_${quoteNo}.png`;

        showToast('⏳ Rendering high-definition invoice...');

        if (typeof html2canvas === 'undefined') {
            showToast('⚠️ Image renderer loading, please try again.');
            return;
        }

        // Capture at 2x scale for crisp typography & branding
        html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            windowWidth: 1200,
            onclone: (clonedDoc) => {
                const clonedWrapper = clonedDoc.getElementById('printableBill');
                if (clonedWrapper) {
                    clonedWrapper.style.display = 'block';
                    clonedWrapper.style.visibility = 'visible';
                    clonedWrapper.style.opacity = '1';
                    clonedWrapper.classList.add('visible');
                }
                const clonedPaper = clonedDoc.getElementById('invoicePaper');
                if (clonedPaper) {
                    clonedPaper.style.display = 'block';
                    clonedPaper.style.visibility = 'visible';
                    clonedPaper.style.opacity = '1';
                }
            }
        }).then(canvas => {
            if (callback) callback(canvas, filename);
        }).catch(err => {
            console.error('Image capture error:', err);
            showToast('⚠️ Renderer issue. Opening browser print view...');
            window.print();
        });
    }

    /**
     * Direct PDF Generator using jsPDF (1 Page if fits, multi-page if large)
     */
    function generateAndDownloadPDF() {
        if (!validateClientInfo()) return;

        showToast('⏳ Generating PDF invoice...');

        generateInvoiceCanvas((canvas, filename) => {
            try {
                const pdfFilename = filename.replace(/\.png$/i, '.pdf');
                const imgData = canvas.toDataURL('image/jpeg', 0.98);

                if (!window.jspdf || !window.jspdf.jsPDF) {
                    showToast('⚠️ PDF engine loading. Opening print view...');
                    window.print();
                    return;
                }

                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
                const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

                const margin = 8; // 8mm margins
                const imgWidth = pageWidth - (margin * 2); // 194mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                const pagePrintableHeight = pageHeight - (margin * 2);

                if (imgHeight <= pagePrintableHeight) {
                    // Standard package: strictly 1 single page!
                    pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
                } else {
                    // Extra large custom package: flows onto 2 pages without cutting off
                    let heightLeft = imgHeight;
                    let position = margin;

                    pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
                    heightLeft -= pagePrintableHeight;

                    while (heightLeft > 0) {
                        position = position - pagePrintableHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
                        heightLeft -= pagePrintableHeight;
                    }
                }

                pdf.save(pdfFilename);
                showToast('✅ PDF downloaded successfully!');
            } catch (err) {
                console.error('jsPDF error:', err);
                showToast('⚠️ Opening browser print view for PDF...');
                window.print();
            }
        });
    }

    /**
     * Direct 1-Click Download of Invoice as PNG Image
     */
    function downloadInvoiceImage() {
        generateInvoiceCanvas((canvas, filename) => {
            canvas.toBlob(blob => {
                if (!blob) {
                    showToast('❌ Unable to generate image blob.');
                    return;
                }
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 150);
                showToast('✅ Invoice image (.png) downloaded successfully!');
            }, 'image/png');
        });
    }

    /**
     * Copies the invoice PNG image directly to clipboard
     */
    function copyInvoiceImageToClipboard() {
        generateInvoiceCanvas((canvas, filename) => {
            canvas.toBlob(blob => {
                if (!blob) {
                    showToast('❌ Unable to create image blob.');
                    return;
                }
                if (navigator.clipboard && window.ClipboardItem) {
                    navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]).then(() => {
                        showToast('📋 Invoice image copied! Paste with <strong>⌘V / Ctrl+V</strong> directly into WhatsApp.');
                    }).catch(err => {
                        console.warn('Clipboard write error:', err);
                        showToast('⚠️ Clipboard not allowed. Downloading image instead...');
                        downloadInvoiceImage();
                    });
                } else {
                    showToast('⚠️ Clipboard not supported on this browser. Downloading image instead...');
                    downloadInvoiceImage();
                }
            }, 'image/png');
        });
    }

    /**
     * Share Invoice Image via WhatsApp
     */
    function shareInvoiceImageViaWhatsApp() {
        generateInvoiceCanvas((canvas, filename) => {
            canvas.toBlob(blob => {
                if (!blob) {
                    showToast('❌ Unable to render image.');
                    return;
                }
                const file = new File([blob], filename, { type: 'image/png' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    navigator.share({
                        files: [file],
                        title: 'Tejas Candid Photography Quotation',
                        text: `Official Quotation for ${state.client.name} (${state.client.eventType || 'Event'})`
                    }).then(() => {
                        showToast('✅ Invoice image shared successfully!');
                    }).catch(err => {
                        if (err.name !== 'AbortError') {
                            fallbackWhatsAppWithImage(blob, filename);
                        }
                    });
                } else {
                    fallbackWhatsAppWithImage(blob, filename);
                }
            }, 'image/png');
        });
    }

    function fallbackWhatsAppWithImage(blob, filename) {
        if (navigator.clipboard && window.ClipboardItem) {
            try {
                navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]).catch(() => {});
            } catch (e) {}
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 150);

        let phoneParam = '918459660254';
        const clientPhoneDigits = (state.client.phone || '').replace(/\D/g, '');
        if (clientPhoneDigits.length >= 10) {
            phoneParam = clientPhoneDigits.startsWith('91') ? clientPhoneDigits : `91${clientPhoneDigits}`;
        }

        const messageText = generateQuoteMessageText();
        const encodedText = encodeURIComponent(messageText);

        showToast('📸 Image saved & copied! Opening WhatsApp chat...');

        setTimeout(() => {
            window.open(`https://wa.me/${phoneParam}?text=${encodedText}`, '_blank');
        }, 400);
    }

    function updateWhatsAppLink(totals) {
        // Placeholder for compatibility
    }

    function copyQuotationText() {
        const text = generateQuoteMessageText();
        navigator.clipboard.writeText(text).then(() => {
            showToast('Quotation text copied to clipboard! Ready to share on WhatsApp.');
        }).catch(() => {
            showToast('Unable to copy automatically. Please print or use WhatsApp share button.');
        });
    }

    // -------------------------------------------------------------
    // RESET TO DEFAULTS
    // -------------------------------------------------------------
    function resetToDefaults() {
        state.client.name = '';
        state.client.phone = '';
        state.client.eventType = 'Wedding & Reception';
        state.client.venue = '';
        state.client.quoteNo = generateQuoteNo();

        state.services.traditional.selected = false;
        state.services.traditional.days = 1;

        state.services.candid.selected = false;
        state.services.candid.days = 1;

        state.services.cinematic.selected = false;
        state.services.cinematic.days = 1;

        state.services.album.selected = false;
        state.services.album.sheets = 30;

        state.services.miniEvent.selected = false;
        state.customItems = [];

        Object.keys(state.complimentary).forEach(k => state.complimentary[k] = true);

        state.financials.discount = 0;
        state.financials.advance = 0;

        initDefaults();
        syncControlsFromState();
        renderCustomItemRows();
        renderAll();
        hideBillSheet();

        showToast('All fields reset.');
    }

    // -------------------------------------------------------------
    // UTILITIES
    // -------------------------------------------------------------
    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /**
     * Unique Timestamp-based Reference Generator
     * Uses year, month, date, hours, minutes, seconds, and milliseconds
     * Format: TC-QUO-YYYY-MMDD-HHmmssSSS (e.g. TC-QUO-2026-1009-141528-982)
     */
    /**
     * Compact Unique Reference Generator
     * Format: TC-QUO-YYYY-XXXX (e.g. TC-QUO-2026-6482)
     * Derived from current time & milliseconds so it is short and unique
     */
    function generateQuoteNo() {
        const now = new Date();
        const YYYY = now.getFullYear();
        const uniqueSuffix = String(now.getTime()).slice(-4);
        return `TC-QUO-${YYYY}-${uniqueSuffix}`;
    }

    function getTodayFormatted() {
        const d = new Date();
        return d.toISOString().split('T')[0];
    }

    function formatDateDisplay(dateStr) {
        if (!dateStr) return '—';
        try {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const d = new Date(parts[0], parts[1] - 1, parts[2]);
                return d.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
            }
            return dateStr;
        } catch (e) {
            return dateStr;
        }
    }

    function showToast(msg) {
        let toast = document.getElementById('quoteToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'quoteToast';
            toast.style.position = 'fixed';
            toast.style.bottom = '30px';
            toast.style.right = '30px';
            toast.style.background = '#0f172a';
            toast.style.color = '#fff';
            toast.style.padding = '14px 24px';
            toast.style.borderRadius = '99px';
            toast.style.fontSize = '14px';
            toast.style.fontWeight = '500';
            toast.style.boxShadow = '0 12px 36px rgba(0,0,0,0.35)';
            toast.style.zIndex = '9999';
            toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            toast.style.display = 'flex';
            toast.style.alignItems = 'center';
            toast.style.gap = '10px';
            toast.style.maxWidth = '90vw';
            document.body.appendChild(toast);
        }

        toast.innerHTML = msg;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';

        if (window._quoteToastTimeout) clearTimeout(window._quoteToastTimeout);
        window._quoteToastTimeout = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
        }, 5000);
    }

    function numberToWords(amount) {
        if (!amount || amount === 0) return 'Rupees Zero Only';

        const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        function convertThreeDigits(n) {
            let res = '';
            if (n >= 100) {
                res += singleDigits[Math.floor(n / 100)] + ' Hundred ';
                n %= 100;
            }
            if (n >= 20) {
                res += tens[Math.floor(n / 10)] + ' ';
                n %= 10;
            } else if (n >= 10) {
                res += teens[n - 10] + ' ';
                return res.trim();
            }
            if (n > 0) {
                res += singleDigits[n] + ' ';
            }
            return res.trim();
        }

        let crore = Math.floor(amount / 10000000);
        let remCrore = amount % 10000000;
        let lakh = Math.floor(remCrore / 100000);
        let remLakh = remCrore % 100000;
        let thousand = Math.floor(remLakh / 1000);
        let remThousand = remLakh % 1000;

        let words = '';
        if (crore > 0) words += convertThreeDigits(crore) + ' Crore ';
        if (lakh > 0) words += convertThreeDigits(lakh) + ' Lakh ';
        if (thousand > 0) words += convertThreeDigits(thousand) + ' Thousand ';
        if (remThousand > 0) words += convertThreeDigits(remThousand);

        words = words.trim();
        return words ? `Rupees ${words} Only` : 'Rupees Zero Only';
    }
});
