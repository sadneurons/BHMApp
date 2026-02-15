# BHC Single-Page Web App: Data Entry From Paper Forms + Live Plain-Language Report (Specification)

## 0. Purpose and scope
Build a single-page web application for brainHEALTH Manchester, optimised for rapid transcription of paper questionnaires and clinic interview forms into structured data, with immediate generation of a patient-facing plain-language report and simple graphical summaries.

Primary use case:
- The patient and informant complete paper booklets at home, bring them to clinic, and a clinician or administrator transcribes responses into the web app.
Secondary use case:
- Clinician completes the forms directly on screen during the appointment.

Core requirement:
- Every user interaction that changes form state triggers an immediate update of the generated report and charts.

Forms included in scope, based on uploaded documents:
- Patient pre-assessment booklet, including sleep, anxiety, depression, diet, alcohol use, quality of life, and hearing sections. :contentReference[oaicite:0]{index=0}
- Friend or relative booklet: Mild Behavioural Impairment Checklist and Neuropsychiatric Inventory Questionnaire style items. :contentReference[oaicite:1]{index=1} :contentReference[oaicite:2]{index=2}
- Semi-structured clinical interview (clinician form). :contentReference[oaicite:3]{index=3}
- PSQI scoring rules document to compute Pittsburgh Sleep Quality Index components and total. :contentReference[oaicite:4]{index=4} :contentReference[oaicite:5]{index=5}

Out of scope for first build:
- Cognitive test administration or scoring beyond what appears in the uploaded booklets.
- EHR integration, unless explicitly requested later.

---

## 1. User journeys

### 1.1 Transcribe paper booklets during clinic
1. Start new “Assessment Session”.
2. Enter identifiers and context.
3. Transcribe Patient Booklet responses section-by-section in the same order and layout as the paper booklet. :contentReference[oaicite:6]{index=6}
4. Transcribe Informant Booklet responses in the same order and layout. :contentReference[oaicite:7]{index=7}
5. Optionally complete the Semi-structured Clinical Interview fields. :contentReference[oaicite:8]{index=8}
6. Review auto-generated plain-language report and charts, edit a small number of “clinician summary” narrative boxes if desired.
7. Export report as printable output and export raw structured data.

### 1.2 Complete directly on screen
Same flow as above, but forms are completed live.

---

## 2. Visual and interaction design requirements

### 2.1 “Resemble the uploaded documents”
The on-screen layout must mirror the paper forms to reduce transcription errors and speed entry:
- Preserve section order, section titles, and question wording as displayed in the booklets. :contentReference[oaicite:9]{index=9}
- Use table layouts where the paper uses tables (PSQI frequency grid, Epworth items list, GAD-7 grid, CASP-19 grid, AUDIT grid). :contentReference[oaicite:10]{index=10} :contentReference[oaicite:11]{index=11} :contentReference[oaicite:12]{index=12}
- Maintain the “tick box” feel for checklists and symptom lists, including hearing situations list. :contentReference[oaicite:13]{index=13}

### 2.2 Large click targets and table-cell selection
For all radio-type responses, implement “clickable cells”:
- Each row is a question.
- Each column is a response option.
- Clicking a cell selects the option for that row, sets the underlying value, and changes the cell background colour.
- Selected cell remains visually obvious at a glance.
- Keyboard accessibility: arrow keys move within the grid; Enter or Space selects.

Examples where this is essential:
- PSQI Question 5 frequency options in columns. :contentReference[oaicite:14]{index=14}
- GAD-7 0–3 frequency options per item. :contentReference[oaicite:15]{index=15}
- CASP-19 “Often / Sometimes / Not often / Never” grid. :contentReference[oaicite:16]{index=16}
- AUDIT multi-column scoring grid. :contentReference[oaicite:17]{index=17}
- MBI-C severity grid “None / Mild / Moderate / Severe”. :contentReference[oaicite:18]{index=18}
- NPI-Q style yes/no plus severity and distress. :contentReference[oaicite:19]{index=19}
- Semi-structured interview symptom frequency and onset tables. :contentReference[oaicite:20]{index=20}

### 2.3 Single page, modular navigation
Single page application with:
- A left navigation rail or top tab bar for major modules.
- Within modules, accordions or anchored subsections.
- A persistent right panel showing the live plain-language report and miniature chart previews.
- A “Report Focus” mode that expands the report to full width for printing review.

### 2.4 Device and accessibility constraints
- Must be fast and usable on a clinic desktop and on a tablet.
- Minimum target size 44x44 px for all selectable controls.
- High contrast, readable type.
- Avoid dense multi-column layout on small screens; switch to stacked rows with horizontal scrolling for large grids.

---

## 3. Data model and session management

### 3.1 Assessment Session object
A single “Assessment Session” stores:
- Session metadata: created timestamp, last edited timestamp, operator name or initials.
- Patient identifiers: name as shown on booklet, date of completion fields where present. :contentReference[oaicite:21]{index=21}
- Optional clinical identifiers: NHS number, clinician name, informant name and relationship. :contentReference[oaicite:22]{index=22}
- Form responses: one structured object per instrument.
- Derived scores: computed fields for instruments with scoring.
- Audit log: list of all edits.

### 3.2 Audit log requirements
Every change event appends an audit record:
- Timestamp
- Field identifier
- Old value, new value
- Operator identity if available
- Source mode: “transcribed from paper” vs “completed live”

Provide an “Audit” tab for medico-legal review and export.

### 3.3 Storage modes
Support two operational modes:
- Local mode: data stored in browser local storage for quick pilots, with explicit export required to persist outside the device.
- Server mode placeholder: define interfaces for later secure persistence, but do not implement unless requested.

---

## 4. Instruments and fields to implement

### 4.1 Patient booklet module (mirror the PDF)

#### 4.1.1 PSQI: Pittsburgh Sleep Quality Index
Fields from booklet: bedtime time, sleep latency minutes, wake time, sleep hours, sleep disturbance frequency items 5a–5j, sleep medication frequency, daytime sleepiness frequency, enthusiasm problem rating, overall sleep quality rating, bed partner/room mate and partner-reported items. :contentReference[oaicite:23]{index=23} :contentReference[oaicite:24]{index=24}

Data types:
- Times: accept HH:MM with flexible entry.
- Minutes: integer, allow range text per scoring rule handling.
- Frequency items: integer 0–3 per the scoring document note. :contentReference[oaicite:25]{index=25}

Derived scoring:
- Implement PSQI component scores and total using PSQI-Scoring.docx rules, including the Q5j missing handling described in the document. :contentReference[oaicite:26]{index=26} :contentReference[oaicite:27]{index=27}
- Output:
  - Component scores: Duration, Disturbance, Latency, Day Dysfunction, Habitual Sleep Efficiency, Overall Quality, Medication.
  - Global total 0–21.
  - Interpretation text: “<5 good sleep quality” and “>5 poor sleep quality” as stated. :contentReference[oaicite:28]{index=28}

UI requirements:
- Use a table for Q5 items with columns matching the booklet frequency categories. :contentReference[oaicite:29]{index=29}
- Bed partner section only shows if a partner/room mate is present. :contentReference[oaicite:30]{index=30}

#### 4.1.2 Epworth Sleepiness Scale
Fields: 8 situations, each rated 0–3, total. :contentReference[oaicite:31]{index=31}
Derived score: sum of 8 items.

#### 4.1.3 Anxiety: GAD-7 style grid
Fields: 7 items rated 0–3 and an impairment item with four options. :contentReference[oaicite:32]{index=32}
Derived score: sum of item scores, plus store impairment separately.

#### 4.1.4 Depression: 15-item yes/no questionnaire
Fields: 15 yes/no items with response ordering as shown. :contentReference[oaicite:33]{index=33}
Derived score rule for transcription safety:
- Score 1 point for the “depressive” response.
- Define the depressive response as the first response option printed on the form for each item, since the booklet alternates “No Yes” and “Yes No”. :contentReference[oaicite:34]{index=34}
- Total is sum of depressive responses.

#### 4.1.5 Mediterranean Diet Score Tool
Fields: 14 yes/no items, total score is total count of “Yes” answers as explicitly stated. :contentReference[oaicite:35]{index=35} :contentReference[oaicite:36]{index=36}

UI:
- Present as a checklist with yes/no cell selection.
- Show the “TOTAL SCORE (total no. of ‘yes’ answers)” live. :contentReference[oaicite:37]{index=37}

#### 4.1.6 AUDIT: Alcohol Use Disorders Identification Test
Fields: 10 questions with response options shown in the grid, plus total score line. :contentReference[oaicite:38]{index=38}
Derived score:
- Implement numeric scoring based on the column selected in the booklet grid.
- Items 9–10 are three-option items as shown; map these to the standard AUDIT scoring used by the grid. :contentReference[oaicite:39]{index=39}

#### 4.1.7 CASP-19 Quality of Life Scale (ELSA version)
Fields: 19 statements rated Often/Sometimes/Not often/Never, with the scoring direction varying by item as displayed in the scoring grid. :contentReference[oaicite:40]{index=40}
Derived score:
- Use the item-specific scoring directions exactly as per the printed grid, since some items are reverse-scored. :contentReference[oaicite:41]{index=41}
- Store subdomain labels if needed, as the booklet indicates sub-domain and item numbers. :contentReference[oaicite:42]{index=42}

#### 4.1.8 Hearing and ears
Fields:
- Free text: duration of hearing problem, which ear affected. :contentReference[oaicite:43]{index=43}
- Yes/no items: sudden change, fluctuation, pain, discharge, operations, perforation, tinnitus, hyperacusis. :contentReference[oaicite:44]{index=44}
- Follow-up prompts: ENT review outcome, hearing aids usage and preferences. :contentReference[oaicite:45]{index=45}
- Hearing difficulties checklist: 1–17 situations and a “top 3 most affected” entry. :contentReference[oaicite:46]{index=46}

Derived outputs:
- Count of affected situations.
- “Top 3” list for report display.

---

### 4.2 Informant booklet module

#### 4.2.1 MBI-C: Mild Behavioural Impairment Checklist
Fields:
- Multiple items grouped into domains with response options None/Mild/Moderate/Severe as shown. :contentReference[oaicite:47]{index=47} :contentReference[oaicite:48]{index=48}
Derived scores:
- Encode None=0, Mild=1, Moderate=2, Severe=3.
- Provide domain totals and overall total.
- Report should show domain profile as bars.

#### 4.2.2 NPI-Q style symptoms with severity and distress
Fields:
- For each symptom: Yes/No, severity 1–3, distress 0–5, with the instruction text shown. :contentReference[oaicite:49]{index=49}
Derived scores:
- Symptom count.
- Total severity score.
- Total distress score.
- Highlight top distress drivers in report.

---

### 4.3 Semi-structured clinical interview module (clinician form)
Fields must mirror the docx layout, with table-driven symptom screens and background sections.

Minimum sections from the uploaded interview excerpt:
- Header identifiers: date, clinician, client, NHS number, informant, relationship. :contentReference[oaicite:50]{index=50}
- Cognitive symptoms screen:
  - New learning/memory table with Y/N, frequency (Daily/Weekly/Monthly/Occasional), onset. :contentReference[oaicite:51]{index=51}
  - Word-finding/language table, plus primary language, other languages, longstanding language difficulty, hearing impairment. :contentReference[oaicite:52]{index=52}
  - Wayfinding/visuospatial table with Present/Stopped/Safety concern and onset, plus examples. :contentReference[oaicite:53]{index=53}
- Background and context:
  - Personal history brief fields. :contentReference[oaicite:54]{index=54}
  - Head injury section with structured durations and details. :contentReference[oaicite:55]{index=55}
  - Premorbid personality clinician ratings. :contentReference[oaicite:56]{index=56}
  - Education and occupation. :contentReference[oaicite:57]{index=57}
  - Substance use including AUDIT completion and score fields. :contentReference[oaicite:58]{index=58}

Derived outputs:
- No formal score required.
- Summarise key positives, safety concerns, and onset patterns into report narrative.

UI:
- Use the same table structure as the docx with cell-click selection.
- Allow free-text examples fields beneath each symptom table.

---

## 5. Live report generation (plain language)

### 5.1 Report structure
Generated report must be understandable to a patient and carer, with minimal jargon. Sections:
1. About this report
2. Sleep
3. Mood and worry
4. Alcohol
5. Diet pattern
6. Quality of life
7. Hearing
8. Changes noticed by family or friends
9. Clinician interview summary (optional if completed)
10. Next steps and signposting (configurable boilerplate)

### 5.2 Real-time update rule
Any change in any field triggers:
- Recompute all derived scores affected.
- Regenerate relevant report paragraphs.
- Rerender charts.

No manual “refresh” action.

### 5.3 Plain-language mapping rules
For each instrument, implement a deterministic mapping from score bands to short text snippets.
Examples:
- PSQI: if total >5, insert “Your responses suggest your sleep has been disrupted over the last month” and list the highest contributing components, using the component scores from the scoring rules. :contentReference[oaicite:59]{index=59}
- Hearing checklist: if multiple situations are ticked, include “You reported hearing difficulties in these situations” and show top 3 priorities. :contentReference[oaicite:60]{index=60}
- NPI-Q: list symptoms marked Yes and highlight those with highest distress ratings. :contentReference[oaicite:61]{index=61}

All text should be templated and versioned.

### 5.4 Clinician editable inserts
Allow optional clinician edits in three bounded text areas:
- One-paragraph “overall summary”
- “What we agreed today”
- “Safety and follow-up”

Edits remain separate from the auto-generated text so regeneration does not overwrite clinician content.

---

## 6. Charts and graphical summaries

### 6.1 Chart types
Use simple bar charts with clear labels and thresholds. Charts required:
- PSQI: total and seven components. :contentReference[oaicite:62]{index=62}
- Epworth: total. :contentReference[oaicite:63]{index=63}
- Anxiety total score and impairment response displayed as a tag. :contentReference[oaicite:64]{index=64}
- Depression total score.
- Mediterranean diet total yes count. :contentReference[oaicite:65]{index=65}
- AUDIT total score. :contentReference[oaicite:66]{index=66}
- CASP-19 total score and optionally subdomain totals, if implemented from the grid. :contentReference[oaicite:67]{index=67}
- MBI-C domain bars and total. :contentReference[oaicite:68]{index=68}
- NPI-Q: symptom count, total severity, total distress. :contentReference[oaicite:69]{index=69}

### 6.2 Visual rules
- Bars should have consistent scaling within each chart.
- Threshold markers as vertical lines where thresholds exist.
- Colour usage should be restrained and consistent.

### 6.3 Report embedding
In “patient report” view:
- Place charts adjacent to their narrative section.
In “data entry” view:
- Show compact chart thumbnails in the report side panel.

---

## 7. Validation, error handling, and data quality

### 7.1 Required field rules
Implement instrument-specific missingness rules:
- PSQI: questions 1–9 not allowed to be missing per scoring doc; if missing, derived scores that depend on them are missing. :contentReference[oaicite:70]{index=70}
- For other forms: allow partial completion but show completeness indicators.

### 7.2 Input coercion and guardrails
- PSQI minutes to fall asleep can be entered as a range; implement the rule “split the difference” when a range is given. :contentReference[oaicite:71]{index=71}
- Times: accept “2230”, “22:30”, “10:30pm”.
- Numeric fields: block non-numeric characters unless explicitly allowed.

### 7.3 “Paper transcription” ergonomics
- Each module has a “paper mode” with larger spacing and page break hints that align with the booklet pages.
- Provide a progress indicator that matches booklet page sequence for the patient booklet. :contentReference[oaicite:72]{index=72}

---

## 8. Export and print requirements

### 8.1 Outputs
Must support:
- Print-ready patient report.
- Export raw data as JSON.
- Export derived scores summary as CSV.
- Export audit log.

### 8.2 Print layout
- A4 print CSS.
- Header includes patient name and date entered.
- Footer includes version string for the report template and app build.

---

## 9. Non-functional requirements

### 9.1 Performance
- Form interactions should feel immediate; report updates in under 150 ms for typical hardware.

### 9.2 Security and privacy (baseline)
- Do not transmit data off device in Local mode.
- Provide a prominent “Not saved to server” banner in Local mode to prevent false assumptions.
- When Server mode is implemented later, require NHS-appropriate controls, but do not design beyond interfaces in v1.

### 9.3 Versioning
- Version the instrument templates and report text templates separately from code to support future edits to booklets without breaking older exports.

---

## 10. Implementation notes for the coding AI (no code, just constraints)

### 10.1 Recommended front-end approach
- Use a reactive framework that supports derived state and computed properties so live report regeneration is reliable.
- Charts should be a lightweight client-side library with print compatibility.

### 10.2 State architecture
- Centralised session state store.
- Derived scores computed from raw responses and cached.
- Report sections generated from templates fed by raw and derived values.

### 10.3 Testing requirements
- Snapshot tests for report text given known inputs.
- Scoring unit tests for PSQI based strictly on PSQI-Scoring.docx rules. :contentReference[oaicite:73]{index=73}
- Form interaction tests for grid selection and keyboard navigation.

---

## 11. Open decisions to confirm with Ross (do not block build; implement as configurable constants)
1. Threshold bands and phrasing for non-PSQI instruments in the report, including what constitutes “mild/moderate/high” for each.
2. Whether the report should include explicit numeric scores for all instruments, or only graphical summaries.
3. Local mode vs server mode default for the first deployment environment.

---

## 12. Acceptance criteria
- A user can transcribe every item from the patient booklet and informant booklet exactly as printed, with a layout that visibly matches the source documents. :contentReference[oaicite:74]{index=74} :contentReference[oaicite:75]{index=75}
- All “grid” questions are answerable via large clickable cells that change colour on selection.
- PSQI scoring matches PSQI-Scoring.docx component and total definitions, including missing handling. :contentReference[oaicite:76]{index=76} :contentReference[oaicite:77]{index=77}
- Every input change immediately updates the plain-language report and charts, with no manual refresh.
- Report is printable and exports are available for JSON, CSV, and audit log.

---

## 13. Additional instruments (implemented post-v1)

### 13.1 RBANS Calculator & Supplementary Analysis
Full implementation of the Repeatable Battery for the Assessment of Neuropsychological Status:
- **12 subtest raw score inputs**: List Learning, Story Learning, Figure Copy, Line Orientation, Picture Naming, Semantic Fluency, Digit Span, Coding, List Recall, List Recognition, Story Recall, Figure Recall.
- **Demographics**: Age (auto-derived from DOB on Session tab), Sex (auto-derived from Session tab), Years of Education (auto-derived from Clinical Interview), Ethnicity, TOPF score.
- **Standard RBANS scoring**: Age-banded lookup tables (50s, 60s, 70s, 80+) for 5 domain indices (Immediate Memory, Visuospatial/Constructional, Language, Attention, Delayed Memory) and Total Scale score.
- **Duff regression norms**: Age/sex/education/ethnicity-adjusted index scores and percentiles for all 5 domains and Total Scale, using published regression coefficients (Duff & Ramezani 2015, Duff et al. 2003).
- **TOPF estimated FSIQ**: Polynomial regression from TOPF raw score, education, and sex.
- **Effort indices**: Silverberg EI (digit span + list recognition composite) with published sensitivity/specificity table; Novitski ES.
- **Cortical-Subcortical Index**: Beatty (2003) method.
- **Chart**: Plotly.js multi-axis plot with severity bands, percentile axis, separate Total Scale column, Standard Norms and Duff Adjusted lines. 2:1 vertical-to-horizontal aspect ratio (A5 proportions for the plot area).
- **Domain narratives**: Auto-generated plain-language summaries for each cognitive domain.

### 13.2 CDR: Clinical Dementia Rating
- **Assessment tab**: Full CDR worksheet with 6 domains (Memory, Orientation, Judgement & Problem Solving, Community Affairs, Home & Hobbies, Personal Care), each with structured rating scales matching the published CDR form.
- **Scoring tab**: Washington University CDR scoring algorithm implementation with global CDR score (0, 0.5, 1, 2, 3), CDR Sum of Boxes, and classification labels.

### 13.3 DIAMOND Lewy Screening Tool
- Structured screening for Lewy body dementia features across multiple domains: essential features, core clinical features (fluctuating cognition, visual hallucinations, REM sleep behaviour disorder, parkinsonism), supportive features, and biomarker indicators.
- Probability classification based on the number and type of endorsed features.

### 13.4 Neuroimaging Review
- Multi-scan support with modality selector (MRI, CT, FDG-PET, Amyloid PET, Tau PET, DaTSCAN, MIBG, EEG).
- Structured findings fields per modality (e.g., MTA grade, Fazekas scale, microbleeds, Centiloid, Braak stage).
- Clinician interpretation free text per scan.
- All findings flow into the report with modality-appropriate narrative generation.

### 13.5 Medical History
- Structured entry for cardiovascular, neurological, psychiatric, and family history.
- Dementia-specific family history tracking.
- Allergies and adverse reactions.

### 13.6 Medications
- Dynamic medication list with name, dose, frequency, route, indication, and category (Dementia, Psychiatric, Cardiovascular, Analgesic, Other).
- Recent changes and adherence tracking.
- Category-grouped display in the report.

### 13.7 Physical Examination
- **Anthropometrics**: Height, weight, BMI (auto-calculated), neck circumference, waist circumference.
- **Vital signs**: Blood pressure (systolic/diastolic), heart rate, O2 saturation, temperature, respiratory rate.
- **General observations**: Gait, tremor, rigidity, nutritional status.
- **Focal neurological signs** and other findings (free text).
- **STOP-BANG Sleep Apnoea Screen**: Auto-populated from data collected elsewhere (snoring from PSQI, tiredness from Epworth, BMI from anthropometrics, age, neck circumference, sex) with remaining items collected in-situ. Infographic display in report with letter-based icon grid.

### 13.8 QRISK3 Cardiovascular Risk Calculator
- Full QRISK3-2017 algorithm implementation (Hippisley-Cox et al., BMJ 2017).
- Captures all required inputs (age, sex, ethnicity, smoking, diabetes type, clinical measurements, conditions, medications).
- Auto-populates from data already entered elsewhere in the app (BMI, blood pressure, smoking status, medical history).
- 10-year cardiovascular risk percentage with risk classification.
- Smiley-face grid infographic for patient-friendly risk communication.

### 13.9 Diagnosis Coding
- Multi-axis diagnostic coding with searchable combobox.
- Comprehensive catalogue covering MCI subtypes, Alzheimer's variants, vascular, Lewy body spectrum, frontotemporal, mixed, reversible causes, functional, and other diagnoses.
- Each diagnosis includes SNOMED-CT and ICD-10 codes.
- Qualifiers: confirmed/probable/possible/rule-out.
- Free text annotation per diagnosis.

---

## 14. Export enhancements (post-v1)

### 14.1 DOCX Export
- Full Word document generation using the `docx` library (client-side).
- Custom font embedding (Gill Sans MT Std) via OOXML manipulation with JSZip.
- Structured sections mirroring the HTML report with consistent formatting.
- **Graphical summary page**: Landscape A4 page with a table-based layout arranging all instrument charts. RBANS chart spans 3 rows in a right-hand column; remaining charts arranged in a 3-column main grid plus a 4-column overflow row. Chart images captured via `html2canvas` (DOM-based charts) and `Plotly.toImage()` (Plotly charts).
- Print-ready formatting with headers, footers, and page breaks.

---

## 15. UI features (post-v1)

### 15.1 Theme Picker
- Bootswatch theme integration with 10+ themes (Default, Cosmo, Flatly, Journal, Lux, Minty, Slate, Solar, Superhero, Vapor, Cyborg, Dracula).
- Theme preference persisted in localStorage (unencrypted — no PHI).
- Early theme application script prevents flash of wrong theme on load.

### 15.2 Snippet Library
- Boilerplate text snippet system for patient information inserts in the report.
- Side panel with categorised, searchable, draggable snippet cards.
- Drop zones in report sections accept dragged snippets.
- Snippet manager modal for CRUD operations, import/export as JSON.
- Default snippets inlined at build time from `snippets.json`.
- User customisations persisted in localStorage (encrypted).

### 15.3 Speech Dictation
- Web Speech API integration for clinician note textareas.
- Microphone button on each clinician insert area.
- Graceful fallback for unsupported browsers.

---

## 16. Security (implemented)

### 16.1 AES-256-GCM Encryption for localStorage
- All patient data encrypted at rest in localStorage using the Web Crypto API.
- **Key derivation**: User-chosen 4-6 digit PIN -> PBKDF2 with 600,000 iterations + random 16-byte salt -> AES-256-GCM CryptoKey.
- **Encrypted envelope format**: `{v:1, salt, iv, ct}` — random 12-byte IV per write, GCM authenticated encryption.
- **PIN verification**: Encrypted marker string (`bhm_pin_check`) — GCM authentication tag failure detects wrong PIN without revealing data.
- **Session caching**: Derived CryptoKey exported as JWK to sessionStorage (tab-scoped, clears on tab close). Page refresh does not re-prompt for PIN.
- **Legacy migration**: Automatically detects and re-encrypts pre-encryption plaintext data on first save after PIN setup.
- **Forgotten PIN recovery**: "Reset all data" option with double confirmation. No backdoor — encryption is irrecoverable without the PIN.
- **What is NOT encrypted**: Theme preference (`bhm-theme`) — contains no PHI.

### 16.2 Content Security Policy (CSP)
Meta tag with the following directives:
- `default-src 'self'`
- `script-src 'self' 'unsafe-inline' cdn.jsdelivr.net` — `unsafe-inline` required for built single-file version
- `style-src 'self' 'unsafe-inline' cdn.jsdelivr.net`
- `font-src cdn.jsdelivr.net`
- `img-src 'self' data: blob:` — required for chart image generation
- `connect-src 'none'` — **blocks all network exfiltration** (fetch, XHR, WebSocket)
- `object-src 'none'` — blocks plugin injection
- `form-action 'none'` — blocks form submission to external URLs
- `base-uri 'self'` — prevents base tag hijacking

### 16.3 Subresource Integrity (SRI)
All CDN-loaded scripts and stylesheets carry `integrity="sha384-..."` and `crossorigin="anonymous"` attributes, preventing execution of tampered CDN resources:
- Bootstrap CSS, Bootstrap Icons CSS
- Bootstrap JS bundle, Chart.js, docx.js, JSZip, html2canvas, Plotly.js

### 16.4 Import Sanitization
- Snippet JSON import validates structure (array of objects with expected string fields only).
- HTML tags stripped from all imported text content.
- File size limited to 500 KB.

### 16.5 Output Escaping
- All user-entered text rendered in the HTML report is escaped via `esc()` (textContent -> innerHTML pattern) to prevent stored XSS.

---

## 17. Build and deployment

### 17.1 Technology stack
- **Vanilla JavaScript** — no framework, no build toolchain beyond a shell script.
- **Bootstrap 5** (CDN) — UI framework and responsive layout.
- **Chart.js** (CDN) — bar charts, traffic lights, severity bars, wind roses, infographics.
- **Plotly.js** (CDN) — RBANS multi-axis chart.
- **docx** library (CDN) — client-side Word document generation.
- **JSZip** (CDN) — OOXML font embedding in DOCX.
- **html2canvas** (CDN) — DOM-based chart capture for DOCX export.

### 17.2 Build process
`build.sh` bundles the entire application into a single self-contained HTML file (`dist/bhm-app.html`):
- All CSS inlined in a `<style>` block.
- All JS concatenated in load order into a single `<script>` block.
- Default snippets from `snippets.json` inlined as a JS variable.
- Gill Sans MT Std font files base64-encoded for DOCX embedding.
- CDN dependencies loaded at runtime (not inlined — too large).
- CSP meta tag and SRI hashes included in the built output.

### 17.3 File structure
```
src/
  index.html          — Main HTML shell with modals, navigation, content areas
  css/styles.css      — Custom styles
  snippets.json       — Default boilerplate snippets
  js/
    crypto.js         — AES-256-GCM encryption module
    themes.js         — Bootswatch theme picker
    state.js          — Centralised state store with encrypted persistence
    app.js            — Application controller (async init with PIN unlock)
    snippets.js       — Snippet library with encrypted storage
    components/
      clickableGrid.js — Reusable grid selection component
    instruments/       — One file per instrument/section
      session.js, psqi.js, epworth.js, gad7.js, depression.js,
      diet.js, auditTool.js, casp19.js, hearing.js, mbiC.js,
      npiQ.js, clinicalInterview.js, rbansNorms.js, rbans.js,
      cdr.js, diamondLewy.js, neuroimaging.js, medicalHistory.js,
      medications.js, physicalExam.js, qrisk3.js, diagnosis.js
    scoring/
      scoring.js       — Cross-instrument derived scores (STOP-BANG)
      qrisk3Algorithm.js — QRISK3-2017 survival model
    report/
      reportGenerator.js — Live HTML report generation
      charts.js          — All chart rendering functions
    export/
      exporter.js      — JSON, CSV, audit log, print export
      docxExport.js    — Word document generation
Source docs/           — Reference PDFs, source HTML calculators, fonts
build.sh              — Single-file build script
dist/bhm-app.html     — Built output (single file, ~1.2 MB)
```
