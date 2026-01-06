# Process Diagram Generator

A web application that generates professional process flow diagrams from text inputs and integrates with Power Automate.

## Features

- Generate Mermaid.js diagrams from manual and automation process descriptions
- Export diagrams as high-quality PNG images
- API endpoint for Power Automate integration
- Clean, professional UI for manual diagram creation

## Power Automate Integration

### API Endpoint

**POST** `/api/generate-diagrams`

This endpoint receives process descriptions from Power Automate, generates diagrams, and returns PNG images as base64-encoded strings.

### Request Format

```json
{
  "manualSteps": "Step 1: User submits form\nStep 2: Manager reviews\nStep 3: Approval decision",
  "automationSteps": "Step 1: Trigger on form submission\nStep 2: Send email notification\nStep 3: Update database",
  "apiKey": "your-secret-api-key"
}
```

**Fields:**
- `manualSteps` (required): Multi-line text describing manual process steps
- `automationSteps` (required): Multi-line text describing automation process steps
- `apiKey` (optional): Authentication key if `API_KEY` environment variable is set

### Response Format

```json
{
  "success": true,
  "diagrams": [
    {
      "type": "Manual",
      "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
      "mimeType": "image/png"
    },
    {
      "type": "Automation",
      "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
      "mimeType": "image/png"
    }
  ]
}
```

### Setting Up Power Automate

#### 1. Configure Environment Variables (Optional)

In your Vercel project, add the following environment variable for API key authentication:

- `API_KEY` - Your secret authentication key

#### 2. Create HTTP Action in Power Automate

1. Add an **HTTP** action to your flow
2. Configure the action:

   - **Method**: `POST`
   - **URI**: `https://your-app.vercel.app/api/generate-diagrams`
   - **Headers**:
     ```
     Content-Type: application/json
     ```
   - **Body**:
     ```json
     {
       "manualSteps": "Step 1: User fills form\nStep 2: Submit for review\nStep 3: Manager approves",
       "automationSteps": "Step 1: Receive webhook\nStep 2: Process data\nStep 3: Send email",
       "apiKey": "your-secret-api-key"
     }
     ```

#### 3. Parse JSON Response

Add a **Parse JSON** action after the HTTP action:

- **Content**: `Body` (from HTTP action)
- **Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean"
      },
      "diagrams": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string"
            },
            "imageBase64": {
              "type": "string"
            },
            "mimeType": {
              "type": "string"
            }
          }
        }
      }
    }
  }
  ```

#### 4. Save or Use PNG Images

To save the diagrams, add a **Create file** action (OneDrive, SharePoint, etc.):

- **File Name**: `Manual-Process-@{utcNow()}.png`
- **File Content**: `base64ToBinary(items('Apply_to_each')?['imageBase64'])`

Or send via email using the **Send an email** action with the base64 data as an attachment.

### Example Flow Diagram

```
Trigger (e.g., Form Submission)
    ↓
HTTP POST to /api/generate-diagrams
    ↓
Parse JSON Response
    ↓
Apply to each diagram
    ↓
Save PNG or Send Email
```

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `API_KEY` (optional) - Secret key for API authentication
- `NEXT_PUBLIC_POWER_AUTOMATE_WEBHOOK_URL` (optional) - Webhook URL for sending diagrams from the UI

## Tech Stack

- Next.js 16
- React 19
- Mermaid.js for diagram generation
- Tailwind CSS
- TypeScript
