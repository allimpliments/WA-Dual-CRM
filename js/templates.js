<!-- templates-builder.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsApp Template Builder - Meta Compatible</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        /* Meta-style template builder */
        .meta-builder {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            background: #f5f6f8;
            padding: 20px;
        }
        .meta-card {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            padding: 24px;
            margin-bottom: 20px;
            border: 1px solid #e4e7ec;
        }
        .meta-card-title {
            font-size: 20px;
            font-weight: 600;
            color: #1a1a2e;
            margin-bottom: 4px;
        }
        .meta-card-subtitle {
            font-size: 13px;
            color: #5f6368;
        }
        .meta-label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #1a1a2e;
            margin-bottom: 4px;
        }
        .meta-label small {
            font-weight: 400;
            color: #5f6368;
        }
        .meta-input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s;
            background: #fff;
        }
        .meta-input:focus {
            border-color: #1a73e8;
            outline: none;
            box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.15);
        }
        .meta-textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            min-height: 100px;
            resize: vertical;
            font-family: inherit;
            transition: border-color 0.2s;
        }
        .meta-textarea:focus {
            border-color: #1a73e8;
            outline: none;
            box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.15);
        }
        .meta-select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            background: #fff;
            cursor: pointer;
            appearance: auto;
        }
        .meta-select:focus {
            border-color: #1a73e8;
            outline: none;
            box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.15);
        }
        .meta-char-count {
            font-size: 12px;
            color: #5f6368;
            text-align: right;
            margin-top: 2px;
        }
        .meta-char-count.warning {
            color: #e37400;
        }
        .meta-char-count.danger {
            color: #d93025;
        }
        .header-type-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 8px;
            margin: 8px 0 12px 0;
        }
        .header-type-btn {
            border: 2px solid #e4e7ec;
            background: #fff;
            padding: 10px 8px;
            border-radius: 10px;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s;
            min-height: 60px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .header-type-btn:hover {
            border-color: #1a73e8;
            background: #f8f9fa;
        }
        .header-type-btn.active {
            border-color: #1a73e8;
            background: #e8f0fe;
        }
        .header-type-btn i {
            font-size: 20px;
            color: #1a73e8;
            margin-bottom: 2px;
        }
        .header-type-btn span {
            font-size: 10px;
            color: #5f6368;
        }
        .meta-upload-zone {
            border: 2px dashed #d1d5db;
            border-radius: 10px;
            padding: 24px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
            background: #fafbfc;
            margin: 8px 0;
        }
        .meta-upload-zone:hover {
            border-color: #1a73e8;
            background: #f8f9fa;
        }
        .meta-upload-zone i {
            font-size: 32px;
            color: #1a73e8;
        }
        .meta-upload-zone p {
            margin: 4px 0 0 0;
            font-size: 13px;
            color: #5f6368;
        }
        .button-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
            padding: 10px 12px;
            background: #f8f9fa;
            border-radius: 8px;
            margin-bottom: 8px;
            border: 1px solid #e4e7ec;
        }
        .button-row select,
        .button-row input {
            flex: 1;
            min-width: 100px;
        }
        .button-row .btn-remove {
            color: #d93025;
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            padding: 0 6px;
        }
        .button-row .btn-remove:hover {
            color: #b31412;
        }
        .btn-meta-primary {
            background: #1a73e8;
            color: #fff;
            border: none;
            padding: 8px 20px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .btn-meta-primary:hover {
            background: #1557b0;
        }
        .btn-meta-secondary {
            background: #f1f3f4;
            color: #1a1a2e;
            border: 1px solid #d1d5db;
            padding: 8px 20px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .btn-meta-secondary:hover {
            background: #e8eaed;
        }
        .btn-meta-warning {
            background: #fbbc04;
            color: #1a1a2e;
            border: none;
            padding: 8px 20px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .btn-meta-warning:hover {
            background: #e5a800;
        }
        .btn-meta-danger {
            background: #d93025;
            color: #fff;
            border: none;
            padding: 8px 20px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .btn-meta-danger:hover {
            background: #b31412;
        }
        .meta-preview {
            background: #e5ddd5;
            border-radius: 12px;
            padding: 16px;
            max-width: 340px;
            margin: 0 auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            position: relative;
        }
        .meta-preview .wa-header-img {
            width: 100%;
            border-radius: 6px;
            margin-bottom: 6px;
            max-height: 200px;
            object-fit: cover;
        }
        .meta-preview .wa-header-video {
            width: 100%;
            border-radius: 6px;
            margin-bottom: 6px;
            background: #000;
            padding: 24px;
            text-align: center;
            color: #fff;
        }
        .meta-preview .wa-header-doc {
            background: #fff;
            border-radius: 6px;
            padding: 10px 12px;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 10px;
            border: 1px solid #e4e7ec;
        }
        .meta-preview .wa-header-text {
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 4px;
            color: #111b21;
        }
        .meta-preview .wa-body {
            font-size: 13px;
            color: #111b21;
            white-space: pre-wrap;
            line-height: 1.5;
            word-break: break-word;
        }
        .meta-preview .wa-body .var-highlight {
            color: #1a73e8;
            font-weight: 600;
            background: #e8f0fe;
            padding: 0 4px;
            border-radius: 3px;
        }
        .meta-preview .wa-footer {
            font-size: 11px;
            color: #667781;
            margin-top: 6px;
        }
        .meta-preview .wa-btn {
            display: block;
            text-align: center;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 4px;
            background: #fff;
            color: #008069;
            border: 1px solid #008069;
            cursor: default;
            transition: none;
        }
        .meta-preview .wa-btn.quick-reply {
            display: inline-block;
            margin-right: 4px;
            border-radius: 16px;
            padding: 4px 14px;
            font-size: 11px;
            background: #e8f0fe;
            border: none;
            color: #1a73e8;
        }
        .meta-preview .wa-btn.url-btn {
            color: #1a73e8;
            border-color: #1a73e8;
        }
        .meta-preview .wa-btn.phone-btn {
            color: #1a73e8;
            border-color: #1a73e8;
        }
        .meta-preview .wa-btn.copy-btn {
            color: #1a73e8;
            border-color: #1a73e8;
        }
        .meta-preview .wa-btn-group {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-top: 6px;
        }
        .meta-preview .wa-time {
            font-size: 11px;
            color: #667781;
            text-align: right;
            margin-top: 4px;
        }
        .catalogue-format-card {
            border: 2px solid #e4e7ec;
            border-radius: 10px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.2s;
            background: #fff;
        }
        .catalogue-format-card:hover {
            border-color: #1a73e8;
        }
        .catalogue-format-card.active {
            border-color: #1a73e8;
            background: #e8f0fe;
        }
        .catalogue-format-card h6 {
            font-weight: 600;
            color: #1a1a2e;
            margin-bottom: 2px;
        }
        .catalogue-format-card p {
            font-size: 13px;
            color: #5f6368;
            margin: 0;
        }
        .filter-tabs {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
            margin-bottom: 12px;
        }
        .filter-tab {
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 13px;
            cursor: pointer;
            border: 1px solid transparent;
            background: transparent;
            color: #5f6368;
            transition: all 0.2s;
        }
        .filter-tab:hover {
            background: #f1f3f4;
        }
        .filter-tab.active {
            background: #e8f0fe;
            color: #1a73e8;
            font-weight: 500;
            border-color: #1a73e8;
        }
        .status-badge {
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 500;
            display: inline-block;
        }
        .status-badge.approved {
            background: #e6f4ea;
            color: #1e7e34;
        }
        .status-badge.pending {
            background: #fef7e0;
            color: #b65c00;
        }
        .status-badge.rejected {
            background: #fce8e6;
            color: #c62828;
        }
        .status-badge.draft {
            background: #f1f3f4;
            color: #5f6368;
        }
        .template-row {
            cursor: pointer;
            padding: 10px 12px;
            border-radius: 8px;
            transition: background 0.15s;
            border-bottom: 1px solid #f1f3f4;
        }
        .template-row:hover {
            background: #f8f9fa;
        }
        .template-row.active {
            background: #e8f0fe;
            border-left: 3px solid #1a73e8;
        }
        .meta-scroll {
            max-height: 70vh;
            overflow-y: auto;
        }
        .meta-scroll::-webkit-scrollbar {
            width: 6px;
        }
        .meta-scroll::-webkit-scrollbar-track {
            background: #f1f3f4;
            border-radius: 3px;
        }
        .meta-scroll::-webkit-scrollbar-thumb {
            background: #c1c7cd;
            border-radius: 3px;
        }
        @media (max-width: 768px) {
            .header-type-grid {
                grid-template-columns: repeat(3, 1fr);
            }
            .meta-card {
                padding: 16px;
            }
            .button-row {
                flex-direction: column;
            }
            .button-row select,
            .button-row input {
                width: 100%;
                min-width: unset;
            }
        }
    </style>
</head>
<body>
<div class="meta-builder">
    <!-- Template List View -->
    <div id="templateListView">
        <div class="meta-card">
            <div class="d-flex justify-content-between align-items-start flex-wrap">
                <div>
                    <div class="meta-card-title">Message Templates</div>
                    <div class="meta-card-subtitle">Manage your WhatsApp message templates</div>
                </div>
                <button class="btn-meta-primary" onclick="TemplateManager.showBuilder()">
                    <i class="fas fa-plus"></i> Create Template
                </button>
            </div>
            <hr class="my-3">
            <!-- Filters -->
            <div class="filter-tabs">
                <button class="filter-tab active" data-tab="all" onclick="TemplateManager.setTab('all')">All</button>
                <button class="filter-tab" data-tab="active" onclick="TemplateManager.setTab('active')">Active</button>
                <button class="filter-tab" data-tab="pending" onclick="TemplateManager.setTab('pending')">Pending</button>
                <button class="filter-tab" data-tab="rejected" onclick="TemplateManager.setTab('rejected')">Rejected</button>
            </div>
            <div class="row g-3">
                <div class="col-md-7">
                    <div class="meta-scroll" id="templateListContainer">
                        <p class="text-muted text-center py-4">Loading templates...</p>
                    </div>
                </div>
                <div class="col-md-5">
                    <div class="border rounded p-3 bg-light" id="previewPanel" style="min-height:200px;">
                        <p class="text-muted text-center mt-3">Select a template to preview</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Template Builder View -->
    <div id="templateBuilderView" style="display:none;">
        <div class="meta-card">
            <div class="d-flex justify-content-between align-items-start flex-wrap">
                <div>
                    <div class="meta-card-title" id="builderTitle">Create Template</div>
                    <div class="meta-card-subtitle" id="builderSubtitle">Utility · Default</div>
                </div>
                <button class="btn-meta-secondary" onclick="TemplateManager.closeBuilder()">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
            <hr class="my-3">
            
            <div class="row g-4">
                <!-- Left: Form -->
                <div class="col-md-7">
                    <!-- Template Name & Language -->
                    <div class="mb-3">
                        <label class="meta-label">Template name and language</label>
                        <div class="row g-2">
                            <div class="col-md-8">
                                <input id="tplName" class="meta-input" placeholder="Enter a template name" 
                                       oninput="TemplateManager.updatePreview()">
                                <div class="meta-char-count"><span id="nameCount">0</span>/512</div>
                            </div>
                            <div class="col-md-4">
                                <select id="tplLanguage" class="meta-select" onchange="TemplateManager.updatePreview()">
                                    <option value="en">English</option>
                                    <option value="en_US">English (US)</option>
                                    <option value="en_GB">English (UK)</option>
                                    <option value="hi">Hindi</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="ar">Arabic</option>
                                    <option value="pt_BR">Portuguese (Brazil)</option>
                                    <option value="de">German</option>
                                    <option value="it">Italian</option>
                                    <option value="ja">Japanese</option>
                                    <option value="ko">Korean</option>
                                    <option value="ru">Russian</option>
                                    <option value="zh_CN">Chinese (Simplified)</option>
                                    <option value="zh_HK">Chinese (Hong Kong)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Category Selection -->
                    <div class="mb-3">
                        <label class="meta-label">Category</label>
                        <div class="row g-2">
                            <div class="col-md-4">
                                <button class="meta-select category-btn" style="text-align:left;padding:10px 12px;" 
                                        onclick="TemplateManager.setCategory('UTILITY')" data-cat="UTILITY">
                                    <i class="fas fa-tools me-2"></i> Utility
                                </button>
                            </div>
                            <div class="col-md-4">
                                <button class="meta-select category-btn" style="text-align:left;padding:10px 12px;" 
                                        onclick="TemplateManager.setCategory('MARKETING')" data-cat="MARKETING">
                                    <i class="fas fa-bullhorn me-2"></i> Marketing
                                </button>
                            </div>
                            <div class="col-md-4">
                                <button class="meta-select category-btn" style="text-align:left;padding:10px 12px;" 
                                        onclick="TemplateManager.setCategory('AUTHENTICATION')" data-cat="AUTHENTICATION">
                                    <i class="fas fa-shield-alt me-2"></i> Authentication
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Catalogue Format (Marketing Only) -->
                    <div id="catalogueFormatSection" style="display:none;" class="mb-3">
                        <label class="meta-label">Catalogue format</label>
                        <div class="row g-2">
                            <div class="col-md-6">
                                <div class="catalogue-format-card" data-format="catalogue" onclick="TemplateManager.setCatalogueFormat('catalogue')">
                                    <h6><i class="fas fa-th-list me-2"></i> Catalogue message</h6>
                                    <p>Include the entire catalogue to give your users a comprehensive view of all of your products.</p>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="catalogue-format-card" data-format="multi" onclick="TemplateManager.setCatalogueFormat('multi')">
                                    <h6><i class="fas fa-th me-2"></i> Multi-product message</h6>
                                    <p>Include up to 30 products from the catalogue. Useful for showcasing new collection or a specific product category.</p>
                                </div>
                            </div>
                        </div>
                        <div id="catalogueSetup" style="display:none;" class="mt-2 p-3 bg-light rounded">
                            <p class="small text-muted mb-2"><i class="fas fa-info-circle me-1"></i> Connecting a catalogue will allow customers to view, message and send carts containing your products and services via WhatsApp.</p>
                            <button class="btn-meta-secondary btn-sm" onclick="alert('Catalogue connection dialog')">
                                <i class="fas fa-link me-1"></i> Manage catalogue connection
                            </button>
                        </div>
                    </div>

                    <!-- Content Section -->
                    <div class="mb-2">
                        <label class="meta-label">Content</label>
                        <div class="small text-muted mb-2">Add a header, body and footer for your template. Cloud API hosted by Meta will review the template variables and content to protect the security and integrity of our services.</div>
                        
                        <!-- Variable Type -->
                        <div class="mb-2">
                            <label class="meta-label">Type of variable</label>
                            <select id="tplVariableType" class="meta-select" onchange="TemplateManager.updatePreview()">
                                <option value="number">Number</option>
                                <option value="name">Name</option>
                                <option value="text">Text</option>
                                <option value="date">Date</option>
                                <option value="currency">Currency</option>
                            </select>
                        </div>

                        <!-- Header -->
                        <div class="mb-2">
                            <label class="meta-label">Header <small>· Optional</small></label>
                            <div class="header-type-grid" id="headerTypeGrid">
                                <div class="header-type-btn active" data-type="none" onclick="TemplateManager.setHeaderType('none')">
                                    <i class="fas fa-ban"></i>
                                    <span>None</span>
                                </div>
                                <div class="header-type-btn" data-type="text" onclick="TemplateManager.setHeaderType('text')">
                                    <i class="fas fa-font"></i>
                                    <span>Text</span>
                                </div>
                                <div class="header-type-btn" data-type="image" onclick="TemplateManager.setHeaderType('image')">
                                    <i class="fas fa-image"></i>
                                    <span>Image</span>
                                </div>
                                <div class="header-type-btn" data-type="video" onclick="TemplateManager.setHeaderType('video')">
                                    <i class="fas fa-video"></i>
                                    <span>Video</span>
                                </div>
                                <div class="header-type-btn" data-type="document" onclick="TemplateManager.setHeaderType('document')">
                                    <i class="fas fa-file-pdf"></i>
                                    <span>Document</span>
                                </div>
                                <div class="header-type-btn" data-type="location" onclick="TemplateManager.setHeaderType('location')">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>Location</span>
                                </div>
                            </div>
                            
                            <div id="headerTextContainer" style="display:none;">
                                <input id="tplHeaderText" class="meta-input" placeholder="Add a short line of text to the header of your message in English"
                                       oninput="TemplateManager.updatePreview()">
                                <div class="meta-char-count"><span id="headerCount">0</span>/60</div>
                            </div>
                            <div id="headerMediaContainer" style="display:none;">
                                <div class="meta-upload-zone" onclick="document.getElementById('headerFileInput').click()">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <p>Drag and drop to upload<br>Or choose files on your device</p>
                                </div>
                                <input type="file" id="headerFileInput" style="display:none" accept="image/*,video/*,.pdf,.doc,.docx" 
                                       onchange="TemplateManager.handleHeaderUpload(this)">
                                <input id="tplHeaderMediaUrl" class="meta-input mt-2" placeholder="Media URL" style="display:none;"
                                       oninput="TemplateManager.updatePreview()">
                                <div id="headerMediaPreview"></div>
                            </div>
                            <div id="headerLocationContainer" style="display:none;">
                                <input id="tplLocationName" class="meta-input" placeholder="Location name" 
                                       oninput="TemplateManager.updatePreview()">
                            </div>
                            <div id="headerVariableBtn" class="mt-1">
                                <button class="btn-meta-secondary btn-sm" onclick="TemplateManager.addVariable('header')">
                                    <i class="fas fa-plus"></i> Add variable
                                </button>
                            </div>
                        </div>

                        <!-- Body -->
                        <div class="mb-2">
                            <label class="meta-label">Body</label>
                            <textarea id="tplBody" class="meta-textarea" placeholder="Enter text in English" 
                                      oninput="TemplateManager.updatePreview()"></textarea>
                            <div class="meta-char-count"><span id="bodyCount">0</span>/1024</div>
                            <div class="d-flex gap-1 flex-wrap mt-1">
                                <button class="btn-meta-secondary btn-sm" onclick="TemplateManager.addVariable('body')">
                                    <i class="fas fa-plus"></i> Add variable
                                </button>
                                <button class="btn-meta-secondary btn-sm" onclick="TemplateManager.insertFormatting('bold')">
                                    <i class="fas fa-bold"></i>
                                </button>
                                <button class="btn-meta-secondary btn-sm" onclick="TemplateManager.insertFormatting('italic')">
                                    <i class="fas fa-italic"></i>
                                </button>
                                <button class="btn-meta-secondary btn-sm" onclick="TemplateManager.insertFormatting('strike')">
                                    <i class="fas fa-strikethrough"></i>
                                </button>
                                <button class="btn-meta-secondary btn-sm" onclick="TemplateManager.insertFormatting('monospace')">
                                    <i class="fas fa-code"></i>
                                </button>
                                <button class="btn-meta-secondary btn-sm" onclick="TemplateManager.openEmojiPicker()">
                                    <i class="far fa-smile"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="mb-2">
                            <label class="meta-label">Footer <small>· Optional</small></label>
                            <input id="tplFooter" class="meta-input" placeholder="Add a short line of text to the bottom of your message in English"
                                   oninput="TemplateManager.updatePreview()">
                            <div class="meta-char-count"><span id="footerCount">0</span>/60</div>
                        </div>

                        <!-- Buttons -->
                        <div class="mb-2">
                            <div class="d-flex justify-content-between align-items-center">
                                <label class="meta-label mb-0">Buttons <small>· Optional</small></label>
                                <button class="btn-meta-secondary btn-sm" onclick="TemplateManager.addButton()">
                                    <i class="fas fa-plus"></i> Add button
                                </button>
                            </div>
                            <div class="small text-muted mb-2">Create buttons that let customers respond to your message or take action. You can add up to ten buttons. If you add more than three buttons, they will appear in a list.</div>
                            <div id="buttonsContainer"></div>
                        </div>
                    </div>

                    <!-- Message Validity Period -->
                    <div class="mb-2 p-3 bg-light rounded">
                        <label class="meta-label">Message validity period</label>
                        <div class="small text-muted mb-2">You can set a custom validity period that your message must be delivered by before it expires. If a message has not been delivered within this time frame, you will not be charged and your customer will not see the message.</div>
                        <div class="form-check mb-1">
                            <input class="form-check-input" type="checkbox" id="customValidity" onchange="TemplateManager.toggleValidity()">
                            <label class="form-check-label small" for="customValidity">Set custom validity period for your message</label>
                        </div>
                        <div id="validityOptions" style="display:none;">
                            <select class="meta-select" style="width:auto;">
                                <option value="5">5 minutes</option>
                                <option value="10" selected>10 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="60">1 hour</option>
                                <option value="180">3 hours</option>
                                <option value="360">6 hours</option>
                                <option value="720">12 hours</option>
                                <option value="1440">24 hours</option>
                            </select>
                            <span class="small text-muted ms-2">Standard: 10 minutes for Utility, 12 hours for Marketing</span>
                        </div>
                    </div>

                    <div class="d-flex gap-2 mt-3 flex-wrap">
                        <button class="btn-meta-primary" onclick="TemplateManager.saveTemplate()">
                            <i class="fas fa-save me-1"></i> Save Draft
                        </button>
                        <button class="btn-meta-warning" onclick="TemplateManager.submitToMeta()">
                            <i class="fas fa-paper-plane me-1"></i> Submit for Review
                        </button>
                        <button class="btn-meta-secondary" onclick="TemplateManager.closeBuilder()">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                    </div>
                </div>

                <!-- Right: Preview -->
                <div class="col-md-5">
                    <label class="meta-label">Template preview</label>
                    <div class="meta-preview" id="livePreview">
                        <div class="wa-body text-muted text-center" style="padding:20px 0;">
                            Enter your template content to see preview
                        </div>
                    </div>
                    <div class="mt-2 text-center small text-muted">
                        <span id="categoryBadge" class="badge bg-secondary">Utility</span>
                        <span id="languageBadge" class="badge bg-secondary ms-1">English</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// ==========================================
// COMPLETE TEMPLATE MANAGER - META COMPATIBLE
// ==========================================

const TemplateManager = {
    // State
    currentTab: 'all',
    selectedTemplateId: null,
    templates: [],
    currentCategory: 'UTILITY',
    currentCatalogueFormat: 'catalogue',
    headerType: 'none',
    buttons: [],
    editingId: null,
    headerMediaFile: null,
    headerMediaUrl: '',

    // ==================== INIT & RENDER ====================
    init() {
        this.loadTemplates();
    },

    async loadTemplates() {
        const container = document.getElementById('templateListContainer');
        container.innerHTML = '<p class="text-muted text-center py-4">Loading templates...</p>';
        
        try {
            // Simulate loading from Firestore or API
            const templates = await this.fetchTemplates();
            this.templates = templates;
            this.renderList();
        } catch (err) {
            container.innerHTML = '<p class="text-danger text-center py-4">Error loading templates: ' + err.message + '</p>';
        }
    },

    async fetchTemplates() {
        // In production: fetch from Firestore
        // For demo, return sample templates
        return [
            { id: '1', name: 'welcome_message', category: 'UTILITY', language: 'en', metaStatus: 'APPROVED', 
              components: [{type:'BODY', text:'Hello {{1}}, welcome to our service!'}] },
            { id: '2', name: 'order_confirmation', category: 'UTILITY', language: 'en', metaStatus: 'PENDING',
              components: [{type:'BODY', text:'Your order #{{1}} has been confirmed.'}] },
            { id: '3', name: 'promo_offer', category: 'MARKETING', language: 'en', metaStatus: 'APPROVED',
              components: [{type:'HEADER', format:'IMAGE', example:{header_handle:['https://via.placeholder.com/400x200']}},
                           {type:'BODY', text:'Special offer just for you! {{1}}'}] },
            { id: '4', name: 'catalogue_showcase', category: 'MARKETING', language: 'en', metaStatus: 'APPROVED',
              components: [{type:'BODY', text:'Check out our latest collection!'}] },
        ];
    },

    renderList() {
        const container = document.getElementById('templateListContainer');
        const filtered = this.templates.filter(t => {
            if (this.currentTab === 'all') return true;
            if (this.currentTab === 'active') return t.metaStatus === 'APPROVED';
            if (this.currentTab === 'pending') return t.metaStatus === 'PENDING';
            if (this.currentTab === 'rejected') return t.metaStatus === 'REJECTED';
            return true;
        });

        if (filtered.length === 0) {
            container.innerHTML = '<p class="text-muted text-center py-4">No templates found.</p>';
            return;
        }

        container.innerHTML = filtered.map(t => `
            <div class="template-row ${this.selectedTemplateId === t.id ? 'active' : ''}" 
                 onclick="TemplateManager.selectTemplate('${t.id}')">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${t.name}</strong>
                        <span class="badge bg-${t.category === 'MARKETING' ? 'warning' : t.category === 'UTILITY' ? 'info' : 'secondary'} ms-1">${t.category}</span>
                    </div>
                    <span class="status-badge ${t.metaStatus?.toLowerCase() || 'draft'}">${t.metaStatus || 'DRAFT'}</span>
                </div>
                <div class="small text-muted">${t.language || 'en'} · ${t.components?.length || 0} components</div>
            </div>
        `).join('');
    },

    selectTemplate(id) {
        this.selectedTemplateId = id;
        const tpl = this.templates.find(t => t.id === id);
        if (tpl) {
            this.showPreview(tpl);
        }
        this.renderList();
    },

    showPreview(tpl) {
        const panel = document.getElementById('previewPanel');
        panel.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h6 class="mb-0">${tpl.name}</h6>
                    <span class="status-badge ${tpl.metaStatus?.toLowerCase() || 'draft'}">${tpl.metaStatus || 'DRAFT'}</span>
                    <span class="badge bg-secondary ms-1">${tpl.category}</span>
                </div>
                <div>
                    <button class="btn-meta-secondary btn-sm" onclick="TemplateManager.editTemplate('${tpl.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-meta-danger btn-sm" onclick="TemplateManager.deleteTemplate('${tpl.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <hr>
            ${this.generatePreviewHTML(tpl)}
            <div class="mt-2">
                <button class="btn-meta-primary btn-sm w-100" onclick="TemplateManager.sendTemplate('${tpl.id}')">
                    <i class="fab fa-whatsapp me-1"></i> Send Template
                </button>
            </div>
        `;
    },

    generatePreviewHTML(tpl) {
        const components = tpl.components || [];
        const header = components.find(c => c.type === 'HEADER');
        const body = components.find(c => c.type === 'BODY');
        const footer = components.find(c => c.type === 'FOOTER');
        const buttonsComp = components.find(c => c.type === 'BUTTONS');
        
        let html = '<div class="meta-preview" style="max-width:100%;">';
        
        if (header) {
            if (header.format === 'IMAGE' && header.example?.header_handle?.[0]) {
                html += `<img src="${header.example.header_handle[0]}" class="wa-header-img" alt="Header">`;
            } else if (header.format === 'VIDEO') {
                html += `<div class="wa-header-video"><i class="fas fa-play-circle" style="font-size:32px;"></i><br><small>Video Preview</small></div>`;
            } else if (header.format === 'DOCUMENT') {
                html += `<div class="wa-header-doc"><i class="fas fa-file-pdf" style="font-size:24px;color:#ef4444;"></i><small>Document</small></div>`;
            } else if (header.text) {
                html += `<div class="wa-header-text">${header.text.replace(/\{\{(\d+)\}\}/g, '<span class="var-highlight">{{$1}}</span>')}</div>`;
            }
        }
        
        if (body) {
            html += `<div class="wa-body">${(body.text || 'Enter your message...').replace(/\{\{(\d+)\}\}/g, '<span class="var-highlight">{{$1}}</span>')}</div>`;
        }
        
        if (footer) {
            html += `<div class="wa-footer">${footer.text}</div>`;
        }
        
        if (buttonsComp && buttonsComp.buttons) {
            const quickReplies = buttonsComp.buttons.filter(b => b.type === 'QUICK_REPLY');
            const actionButtons = buttonsComp.buttons.filter(b => b.type !== 'QUICK_REPLY');
            
            if (quickReplies.length > 0) {
                html += '<div class="wa-btn-group">';
                quickReplies.forEach(b => {
                    html += `<span class="wa-btn quick-reply">${b.text}</span>`;
                });
                html += '</div>';
            }
            
            if (actionButtons.length > 0) {
                actionButtons.forEach(b => {
                    if (b.type === 'URL') html += `<div class="wa-btn url-btn">🌐 ${b.text || 'Visit'}</div>`;
                    else if (b.type === 'PHONE_NUMBER') html += `<div class="wa-btn phone-btn">📞 ${b.text || 'Call'}</div>`;
                    else if (b.type === 'COPY_CODE') html += `<div class="wa-btn copy-btn">📋 ${b.text || 'Copy'}</div>`;
                });
            }
        }
        
        html += `<div class="wa-time">${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>`;
        html += '</div>';
        return html;
    },

    setTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.filter-tab').forEach(el => {
            el.classList.toggle('active', el.dataset.tab === tab);
        });
        this.renderList();
    },

    // ==================== BUILDER ====================
    showBuilder(editId = null) {
        this.editingId = editId;
        document.getElementById('templateListView').style.display = 'none';
        document.getElementById('templateBuilderView').style.display = 'block';
        document.getElementById('builderTitle').textContent = editId ? 'Edit Template' : 'Create Template';
        
        // Reset form
        document.getElementById('tplName').value = '';
        document.getElementById('tplBody').value = '';
        document.getElementById('tplFooter').value = '';
        document.getElementById('tplHeaderText').value = '';
        document.getElementById('headerMediaPreview').innerHTML = '';
        this.buttons = [];
        this.headerType = 'none';
        this.currentCategory = 'UTILITY';
        this.currentCatalogueFormat = 'catalogue';
        this.headerMediaUrl = '';
        
        // Reset header type buttons
        document.querySelectorAll('.header-type-btn').forEach(el => {
            el.classList.toggle('active', el.dataset.type === 'none');
        });
        document.getElementById('headerTextContainer').style.display = 'none';
        document.getElementById('headerMediaContainer').style.display = 'none';
        document.getElementById('headerLocationContainer').style.display = 'none';
        
        // Reset category buttons
        document.querySelectorAll('.category-btn').forEach(el => {
            el.classList.remove('active');
        });
        document.querySelector('[data-cat="UTILITY"]')?.classList.add('active');
        
        // Show/hide catalogue section
        document.getElementById('catalogueFormatSection').style.display = 'none';
        document.getElementById('catalogueSetup').style.display = 'none';
        
        // Reset buttons container
        document.getElementById('buttonsContainer').innerHTML = '';
        
        // Update preview
        this.updatePreview();
        
        // If editing, load template data
        if (editId) {
            const tpl = this.templates.find(t => t.id === editId);
            if (tpl) {
                this.loadTemplateData(tpl);
            }
        }
    },

    loadTemplateData(tpl) {
        document.getElementById('tplName').value = tpl.name || '';
        this.currentCategory = tpl.category || 'UTILITY';
        document.querySelectorAll('.category-btn').forEach(el => {
            el.classList.toggle('active', el.dataset.cat === this.currentCategory);
        });
        document.getElementById('tplLanguage').value = tpl.language || 'en';
        this.currentCatalogueFormat = tpl.catalogueFormat || 'catalogue';
        
        const components = tpl.components || [];
        const header = components.find(c => c.type === 'HEADER');
        const body = components.find(c => c.type === 'BODY');
        const footer = components.find(c => c.type === 'FOOTER');
        const buttonsComp = components.find(c => c.type === 'BUTTONS');
        
        if (header) {
            this.headerType = (header.format || 'text').toLowerCase();
            document.querySelectorAll('.header-type-btn').forEach(el => {
                el.classList.toggle('active', el.dataset.type === this.headerType);
            });
            if (header.text) {
                document.getElementById('tplHeaderText').value = header.text;
                document.getElementById('headerTextContainer').style.display = 'block';
            }
            if (header.example?.header_handle?.[0]) {
                this.headerMediaUrl = header.example.header_handle[0];
                document.getElementById('tplHeaderMediaUrl').value = this.headerMediaUrl;
                document.getElementById('headerMediaContainer').style.display = 'block';
                this.showMediaPreview(this.headerMediaUrl, this.headerType);
            }
        }
        
        if (body) {
            document.getElementById('tplBody').value = body.text || '';
        }
        if (footer) {
            document.getElementById('tplFooter').value = footer.text || '';
        }
        if (buttonsComp && buttonsComp.buttons) {
            this.buttons = buttonsComp.buttons;
            this.renderButtons();
        }
        
        // Show catalogue section if marketing
        if (this.currentCategory === 'MARKETING') {
            document.getElementById('catalogueFormatSection').style.display = 'block';
            document.getElementById('catalogueSetup').style.display = 'block';
            document.querySelectorAll('.catalogue-format-card').forEach(el => {
                el.classList.toggle('active', el.dataset.format === this.currentCatalogueFormat);
            });
        }
        
        this.updatePreview();
    },

    closeBuilder() {
        document.getElementById('templateListView').style.display = 'block';
        document.getElementById('templateBuilderView').style.display = 'none';
        this.loadTemplates();
    },

    setCategory(category) {
        this.currentCategory = category;
        document.querySelectorAll('.category-btn').forEach(el => {
            el.classList.toggle('active', el.dataset.cat === category);
        });
        
        // Show/hide catalogue section
        if (category === 'MARKETING') {
            document.getElementById('catalogueFormatSection').style.display = 'block';
            document.getElementById('catalogueSetup').style.display = 'block';
            document.getElementById('builderSubtitle').textContent = 'Marketing · ' + 
                (this.currentCatalogueFormat === 'catalogue' ? 'Catalogue' : 'Multi-product');
        } else {
            document.getElementById('catalogueFormatSection').style.display = 'none';
            document.getElementById('catalogueSetup').style.display = 'none';
            document.getElementById('builderSubtitle').textContent = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() + ' · Default';
        }
        this.updatePreview();
    },

    setCatalogueFormat(format) {
        this.currentCatalogueFormat = format;
        document.querySelectorAll('.catalogue-format-card').forEach(el => {
            el.classList.toggle('active', el.dataset.format === format);
        });
        document.getElementById('builderSubtitle').textContent = 'Marketing · ' + 
            (format === 'catalogue' ? 'Catalogue' : 'Multi-product');
        this.updatePreview();
    },

    setHeaderType(type) {
        this.headerType = type;
        document.querySelectorAll('.header-type-btn').forEach(el => {
            el.classList.toggle('active', el.dataset.type === type);
        });
        
        document.getElementById('headerTextContainer').style.display = (type === 'text' || type === 'location') ? 'block' : 'none';
        document.getElementById('headerMediaContainer').style.display = ['image', 'video', 'document'].includes(type) ? 'block' : 'none';
        document.getElementById('headerLocationContainer').style.display = type === 'location' ? 'block' : 'none';
        
        if (type === 'location') {
            document.getElementById('tplHeaderText').placeholder = 'Location name';
        } else {
            document.getElementById('tplHeaderText').placeholder = 'Add a short line of text to the header of your message in English';
        }
        
        this.updatePreview();
    },

    handleHeaderUpload(input) {
        const file = input.files[0];
        if (!file) return;
        
        this.headerMediaFile = file;
        
        // For demo, create object URL
        const url = URL.createObjectURL(file);
        this.headerMediaUrl = url;
        document.getElementById('tplHeaderMediaUrl').value = url;
        
        this.showMediaPreview(url, this.headerType);
        this.updatePreview();
    },

    showMediaPreview(url, type) {
        const container = document.getElementById('headerMediaPreview');
        if (type === 'image') {
            container.innerHTML = `<img src="${url}" style="max-width:100%;max-height:150px;border-radius:8px;margin-top:8px;">`;
        } else if (type === 'video') {
            container.innerHTML = `<video src="${url}" style="max-width:100%;max-height:150px;border-radius:8px;margin-top:8px;" controls></video>`;
        } else if (type === 'document') {
            container.innerHTML = `<div class="border rounded p-2 mt-2"><i class="fas fa-file-pdf me-2"></i> ${this.headerMediaFile?.name || 'Document'}</div>`;
        }
    },

    addVariable(target) {
        const varName = prompt('Enter variable name (e.g., customer_name, order_id):');
        if (!varName) return;
        
        let textarea;
        if (target === 'header') {
            textarea = document.getElementById('tplHeaderText');
        } else {
            textarea = document.getElementById('tplBody');
        }
        
        const cursorPos = textarea.selectionStart;
        const text = textarea.value;
        const varText = `{{${varName}}}`;
        textarea.value = text.substring(0, cursorPos) + varText + text.substring(cursorPos);
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = cursorPos + varText.length;
        this.updatePreview();
        this.updateCharCounts();
    },

    insertFormatting(type) {
        const textarea = document.getElementById('tplBody');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.substring(start, end);
        
        let prefix, suffix;
        switch(type) {
            case 'bold': prefix = '*'; suffix = '*'; break;
            case 'italic': prefix = '_'; suffix = '_'; break;
            case 'strike': prefix = '~'; suffix = '~'; break;
            case 'monospace': prefix = '```'; suffix = '```'; break;
            default: return;
        }
        
        const newText = textarea.value.substring(0, start) + prefix + selected + suffix + textarea.value.substring(end);
        textarea.value = newText;
        textarea.focus();
        textarea.selectionStart = start + prefix.length;
        textarea.selectionEnd = end + prefix.length;
        this.updatePreview();
        this.updateCharCounts();
    },

    openEmojiPicker() {
        // Simple emoji picker
        const emojis = ['😊', '👍', '❤️', '🎉', '🔥', '⭐', '✅', '💯', '🎯', '💪', '🙌', '✨', '🌟', '💎', '🚀', '📱', '💻', '🛒', '📦', '🎁'];
        const emoji = prompt('Choose an emoji (click one or type):\n' + emojis.join(' '), '😊');
        if (emoji) {
            const textarea = document.getElementById('tplBody');
            const cursorPos = textarea.selectionStart;
            const text = textarea.value;
            textarea.value = text.substring(0, cursorPos) + emoji + text.substring(cursorPos);
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = cursorPos + emoji.length;
            this.updatePreview();
            this.updateCharCounts();
        }
    },

    // ==================== BUTTONS ====================
    addButton() {
        if (this.buttons.length >= 10) {
            alert('Maximum 10 buttons allowed!');
            return;
        }
        // Count quick reply buttons
        const quickReplies = this.buttons.filter(b => b.type === 'QUICK_REPLY').length;
        if (quickReplies >= 3 && document.querySelector('#buttonsContainer select:last-child')?.value === 'QUICK_REPLY') {
            alert('Maximum 3 Quick Reply buttons allowed!');
            return;
        }
        
        this.buttons.push({ type: 'QUICK_REPLY', text: '' });
        this.renderButtons();
        this.updatePreview();
    },

    removeButton(index) {
        this.buttons.splice(index, 1);
        this.renderButtons();
        this.updatePreview();
    },

    updateButton(index, field, value) {
        this.buttons[index][field] = value;
        if (field === 'type') {
            // Reset additional fields
            if (value === 'URL') this.buttons[index].url = '';
            else if (value === 'PHONE_NUMBER') this.buttons[index].phone_number = '';
            else if (value === 'COPY_CODE') this.buttons[index].example = '';
            this.renderButtons();
        }
        this.updatePreview();
    },

    renderButtons() {
        const container = document.getElementById('buttonsContainer');
        if (this.buttons.length === 0) {
            container.innerHTML = '<div class="text-muted small py-2">No buttons added. Click "Add button" to create one.</div>';
            return;
        }
        
        container.innerHTML = this.buttons.map((b, i) => `
            <div class="button-row">
                <select onchange="TemplateManager.updateButton(${i}, 'type', this.value)" style="min-width:140px;">
                    <option value="QUICK_REPLY" ${b.type === 'QUICK_REPLY' ? 'selected' : ''}>Quick Reply</option>
                    <option value="URL" ${b.type === 'URL' ? 'selected' : ''}>Visit Website</option>
                    <option value="PHONE_NUMBER" ${b.type === 'PHONE_NUMBER' ? 'selected' : ''}>Call Phone Number</option>
                    <option value="COPY_CODE" ${b.type === 'COPY_CODE' ? 'selected' : ''}>Copy Code</option>
                    ${b.type === 'CUSTOM' ? `<option value="CUSTOM" selected>Custom</option>` : ''}
                </select>
                <input placeholder="Button text" value="${b.text || ''}" 
                       onchange="TemplateManager.updateButton(${i}, 'text', this.value)" 
                       maxlength="40">
                ${b.type === 'URL' ? `<input placeholder="https://example.com" value="${b.url || ''}" 
                       onchange="TemplateManager.updateButton(${i}, 'url', this.value)">` : ''}
                ${b.type === 'PHONE_NUMBER' ? `<input placeholder="+91 1234567890" value="${b.phone_number || ''}" 
                       onchange="TemplateManager.updateButton(${i}, 'phone_number', this.value)">` : ''}
                ${b.type === 'COPY_CODE' ? `<input placeholder="Code to copy" value="${b.example || ''}" 
                       onchange="TemplateManager.updateButton(${i}, 'example', this.value)">` : ''}
                <button class="btn-remove" onclick="TemplateManager.removeButton(${i})" title="Remove button">×</button>
            </div>
        `).join('');
    },

    // ==================== PREVIEW ====================
    updatePreview() {
        const name = document.getElementById('tplName')?.value || 'your_template_name';
        const language = document.getElementById('tplLanguage')?.value || 'en';
        const headerType = this.headerType;
        const headerText = document.getElementById('tplHeaderText')?.value || '';
        const headerMediaUrl = document.getElementById('tplHeaderMediaUrl')?.value || this.headerMediaUrl;
        const body = document.getElementById('tplBody')?.value || '';
        const footer = document.getElementById('tplFooter')?.value || '';
        const category = this.currentCategory;
        const catalogueFormat = this.currentCatalogueFormat;
        
        // Update counts
        this.updateCharCounts();
        
        // Update badges
        document.getElementById('categoryBadge').textContent = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
        document.getElementById('languageBadge').textContent = document.getElementById('tplLanguage')?.selectedOptions?.[0]?.text || 'English';
        
        // Build preview
        const preview = document.getElementById('livePreview');
        let html = '<div class="meta-preview" style="max-width:100%;">';
        
        // Header
        if (headerType !== 'none') {
            if (headerType === 'text' && headerText) {
                html += `<div class="wa-header-text">${this.formatText(headerText)}</div>`;
            } else if (headerType === 'image' && headerMediaUrl) {
                html += `<img src="${headerMediaUrl}" class="wa-header-img" alt="Header" onerror="this.style.display='none'">`;
            } else if (headerType === 'video' && headerMediaUrl) {
                html += `<div class="wa-header-video"><i class="fas fa-play-circle" style="font-size:32px;"></i><br><small>Video</small></div>`;
            } else if (headerType === 'document' && headerMediaUrl) {
                html += `<div class="wa-header-doc"><i class="fas fa-file-pdf" style="font-size:24px;color:#ef4444;"></i><small>Document</small></div>`;
            } else if (headerType === 'location') {
                html += `<div class="wa-header-doc"><i class="fas fa-map-marker-alt" style="font-size:24px;color:#ef4444;"></i><small>${headerText || 'Location'}</small></div>`;
            }
        }
        
        // Body
        html += `<div class="wa-body">${this.formatText(body) || 'Enter your message...'}</div>`;
        
        // Footer
        if (footer) {
            html += `<div class="wa-footer">${footer}</div>`;
        }
        
        // Buttons
        const quickReplies = this.buttons.filter(b => b.type === 'QUICK_REPLY' && b.text);
        const actionButtons = this.buttons.filter(b => b.type !== 'QUICK_REPLY' && b.text);
        
        if (quickReplies.length > 0) {
            html += '<div class="wa-btn-group">';
            quickReplies.forEach(b => {
                html += `<span class="wa-btn quick-reply">${b.text}</span>`;
            });
            html += '</div>';
        }
        
        if (actionButtons.length > 0) {
            actionButtons.forEach(b => {
                if (b.type === 'URL') html += `<div class="wa-btn url-btn">🌐 ${b.text}</div>`;
                else if (b.type === 'PHONE_NUMBER') html += `<div class="wa-btn phone-btn">📞 ${b.text}</div>`;
                else if (b.type === 'COPY_CODE') html += `<div class="wa-btn copy-btn">📋 ${b.text}</div>`;
                else html += `<div class="wa-btn">${b.text}</div>`;
            });
        }
        
        // Show "See all options" if more than 3 buttons total
        const totalButtons = this.buttons.filter(b => b.text).length;
        if (totalButtons > 3) {
            html += `<div class="small text-muted text-center mt-1" style="font-size:10px;">See all options</div>`;
        }
        
        html += `<div class="wa-time">${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>`;
        html += '</div>';
        preview.innerHTML = html;
    },

    formatText(text) {
        // Simple formatting for preview
        return text
            .replace(/\{\{([^}]+)\}\}/g, '<span class="var-highlight">{{$1}}</span>')
            .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            .replace(/~(.*?)~/g, '<del>$1</del>')
            .replace(/```(.*?)```/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    },

    updateCharCounts() {
        const name = document.getElementById('tplName')?.value || '';
        document.getElementById('nameCount').textContent = name.length;
        
        const header = document.getElementById('tplHeaderText')?.value || '';
        document.getElementById('headerCount').textContent = header.length;
        
        const body = document.getElementById('tplBody')?.value || '';
        document.getElementById('bodyCount').textContent = body.length;
        
        const footer = document.getElementById('tplFooter')?.value || '';
        document.getElementById('footerCount').textContent = footer.length;
    },

    toggleValidity() {
        const checked = document.getElementById('customValidity').checked;
        document.getElementById('validityOptions').style.display = checked ? 'block' : 'none';
    },

    // ==================== SAVE & SUBMIT ====================
    async saveTemplate() {
        const name = document.getElementById('tplName')?.value?.trim();
        const body = document.getElementById('tplBody')?.value?.trim();
        
        if (!name) return alert('Template name is required!');
        if (!body) return alert('Body content is required!');
        
        const components = [];
        
        // Header
        if (this.headerType !== 'none') {
            const headerComp = { type: 'HEADER' };
            if (this.headerType === 'text' || this.headerType === 'location') {
                headerComp.format = 'TEXT';
                headerComp.text = document.getElementById('tplHeaderText')?.value || '';
            } else if (['image', 'video', 'document'].includes(this.headerType)) {
                headerComp.format = this.headerType.toUpperCase();
                const mediaUrl = document.getElementById('tplHeaderMediaUrl')?.value || this.headerMediaUrl;
                if (mediaUrl) {
                    headerComp.example = { header_handle: [mediaUrl] };
                }
            }
            if (headerComp.text || headerComp.example) {
                components.push(headerComp);
            }
        }
        
        // Body
        components.push({ type: 'BODY', text: body });
        
        // Footer
        const footer = document.getElementById('tplFooter')?.value?.trim();
        if (footer) {
            components.push({ type: 'FOOTER', text: footer });
        }
        
        // Buttons
        const validButtons = this.buttons.filter(b => b.text?.trim());
        if (validButtons.length > 0) {
            const buttons = validButtons.map(b => {
                const btn = { type: b.type, text: b.text.trim() };
                if (b.type === 'URL') btn.url = b.url || '';
                else if (b.type === 'PHONE_NUMBER') btn.phone_number = b.phone_number || '';
                else if (b.type === 'COPY_CODE') btn.example = b.example || '';
                return btn;
            });
            components.push({ type: 'BUTTONS', buttons });
        }
        
        const templateData = {
            name: name.toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 60),
            category: this.currentCategory,
            language: document.getElementById('tplLanguage')?.value || 'en',
            components: components,
            catalogueFormat: this.currentCatalogueFormat,
            metaStatus: 'DRAFT',
            updatedAt: new Date().toISOString()
        };
        
        try {
            // In production: save to Firestore
            console.log('📝 Saving template:', templateData);
            
            // For demo, add to local list
            const newId = 'tpl_' + Date.now();
            this.templates.push({ id: newId, ...templateData });
            alert('✅ Template saved as draft!');
            this.closeBuilder();
        } catch (err) {
            alert('Error saving template: ' + err.message);
        }
    },

    async submitToMeta() {
        const name = document.getElementById('tplName')?.value?.trim();
        if (!name) return alert('Template name is required!');
        
        // First save draft
        await this.saveTemplate();
        
        // Then submit to Meta
        const templateName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 60);
        const language = document.getElementById('tplLanguage')?.value || 'en';
        const components = [];
        
        // Build components for Meta API
        const body = document.getElementById('tplBody')?.value || '';
        components.push({ type: 'BODY', text: body });
        
        const footer = document.getElementById('tplFooter')?.value?.trim();
        if (footer) components.push({ type: 'FOOTER', text: footer });
        
        if (this.headerType !== 'none') {
            const headerComp = { type: 'HEADER' };
            if (this.headerType === 'text' || this.headerType === 'location') {
                headerComp.format = 'TEXT';
                headerComp.text = document.getElementById('tplHeaderText')?.value || '';
            } else if (['image', 'video', 'document'].includes(this.headerType)) {
                headerComp.format = this.headerType.toUpperCase();
                const mediaUrl = document.getElementById('tplHeaderMediaUrl')?.value || this.headerMediaUrl;
                if (mediaUrl) {
                    headerComp.example = { header_handle: [mediaUrl] };
                }
            }
            if (headerComp.text || headerComp.example) {
                components.push(headerComp);
            }
        }
        
        // Buttons
        const validButtons = this.buttons.filter(b => b.text?.trim());
        if (validButtons.length > 0) {
            const buttons = validButtons.map(b => {
                const btn = { type: b.type, text: b.text.trim() };
                if (b.type === 'URL') btn.url = b.url || '';
                else if (b.type === 'PHONE_NUMBER') btn.phone_number = b.phone_number || '';
                else if (b.type === 'COPY_CODE') btn.example = b.example || '';
                return btn;
            });
            components.push({ type: 'BUTTONS', buttons });
        }
        
        const payload = {
            name: templateName,
            category: this.currentCategory,
            language: language,
            components: components
        };
        
        console.log('📤 Submitting to Meta:', JSON.stringify(payload, null, 2));
        
        // In production: call Meta API
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('✅ Template submitted for review!\n\nName: ' + templateName + '\nCategory: ' + this.currentCategory + '\nLanguage: ' + language);
            this.closeBuilder();
        } catch (err) {
            alert('❌ Submission failed: ' + err.message);
        }
    },

    // ==================== SEND TEMPLATE ====================
    async sendTemplate(id) {
        const tpl = this.templates.find(t => t.id === id);
        if (!tpl) return alert('Template not found!');
        if (tpl.metaStatus !== 'APPROVED') {
            return alert('Template must be APPROVED to send. Current status: ' + tpl.metaStatus);
        }
        
        const phone = prompt('Enter phone number with country code (e.g., 919876543210):');
        if (!phone) return;
        
        // Get variables from body
        const bodyComp = tpl.components?.find(c => c.type === 'BODY');
        const variables = bodyComp?.text?.match(/\{\{([^}]+)\}\}/g) || [];
        const variableValues = {};
        
        for (const v of variables) {
            const val = prompt(`Enter value for ${v}:`, '');
            if (val === null) return;
            variableValues[v] = val;
        }
        
        const payload = {
            messaging_product: 'whatsapp',
            to: phone.replace(/[^0-9]/g, ''),
            type: 'template',
            template: {
                name: tpl.name,
                language: { code: tpl.language || 'en' }
            }
        };
        
        // Add variables
        if (Object.keys(variableValues).length > 0) {
            const params = [];
            for (const [key, value] of Object.entries(variableValues)) {
                const index = key.match(/\{\{([^}]+)\}\}/)?.[1] || '';
                params.push({ type: 'text', text: value });
            }
            payload.template.components = [{ type: 'body', parameters: params }];
        }
        
        console.log('📤 Sending template:', JSON.stringify(payload, null, 2));
        
        // In production: call Meta API
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            alert('✅ Template sent successfully to ' + phone + '!\n\nMessage ID: msg_' + Date.now());
        } catch (err) {
            alert('❌ Failed to send: ' + err.message);
        }
    },

    editTemplate(id) {
        this.showBuilder(id);
    },

    async deleteTemplate(id) {
        if (!confirm('Are you sure you want to delete this template?')) return;
        this.templates = this.templates.filter(t => t.id !== id);
        if (this.selectedTemplateId === id) {
            this.selectedTemplateId = null;
            document.getElementById('previewPanel').innerHTML = '<p class="text-muted text-center mt-3">Select a template to preview</p>';
        }
        this.renderList();
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    TemplateManager.init();
});

// Helper: handle media upload via URL paste
document.addEventListener('paste', (e) => {
    const target = e.target;
    if (target.id === 'tplHeaderMediaUrl') {
        const url = target.value;
        if (url && url.startsWith('http')) {
            TemplateManager.headerMediaUrl = url;
            TemplateManager.showMediaPreview(url, TemplateManager.headerType);
            TemplateManager.updatePreview();
        }
    }
});
</script>
</body>
</html>
