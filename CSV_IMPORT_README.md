# CSV Import Feature for Leads

This feature allows users to import leads in bulk from CSV files with field mapping capabilities.

## Features

### 1. CSV Upload & Parsing
- Drag and drop or click to upload CSV files
- Automatic CSV parsing with proper escaping support
- File size validation (max 10MB)
- File type validation (.csv only)

### 2. Field Mapping
- Automatic field detection based on column names
- Manual field mapping for custom CSV formats
- Support for all lead fields including:
  - Basic info: First Name, Last Name, Email, Phone, State, Gender
  - Business info: Exam Category, How did you hear about us?, Status, Plan
  - Financial info: Amount Paid, Subscription Plan
  - Additional info: Referral Code, Notes, Tags

### 3. Data Validation
- Validates required fields (at minimum, name information)
- Filters out invalid rows
- Provides feedback on validation results

### 4. Bulk Import
- Direct Supabase insert for small datasets (< 50 leads)
- Edge Function for large datasets (> 50 leads)
- Batch processing to handle large files efficiently
- Progress indicators and status feedback

### 5. Template & Instructions
- Downloadable CSV template with sample data
- Clear import instructions
- Format guidelines for dates, tags, and numbers

## Usage

### 1. Access the Import Feature
- Navigate to the Leads page
- Click the "Import CSV" button in the header

### 2. Upload CSV File
- Click "Choose File" or drag and drop a CSV file
- The system will automatically parse and display a preview

### 3. Map Fields
- Review the automatic field mapping
- Adjust mappings as needed using the dropdown menus
- Skip columns that don't need to be imported

### 4. Preview Data
- Review the first 5 rows of your data
- Ensure the mapping looks correct

### 5. Import
- Click "Import [X] Leads" to start the import process
- Monitor the progress and status messages
- The modal will close automatically on successful import

## CSV Format Requirements

### Required Fields
- At minimum, either "First Name" or "Last Name" (or both)

### Optional Fields
- Email, Phone, State, Gender
- Exam Category, How did you hear about us?
- Status, Plan, Referral Code, Notes
- Tags, Amount Paid, Subscription Plan

### Data Format Guidelines
- **Tags**: Separate multiple tags with semicolons (e.g., "legal;court-reporting")
- **Dates**: Use YYYY-MM-DD format (e.g., "2024-01-15")
- **Amount Paid**: Use numbers only (e.g., "500" for ₹500)
- **Phone**: Include country code if needed (e.g., "+91-9876543210")

## Technical Implementation

### Frontend Components
- `CSVImport.tsx`: Main import component with field mapping
- Updated `Leads.tsx`: Added import button and modal integration
- Updated `CRMContext.tsx`: Added bulk import functionality

### Backend Functions
- `bulk-import-leads` Edge Function: Handles large dataset imports
- Direct Supabase operations for smaller datasets

### File Structure
```
src/
├── components/
│   └── CSVImport.tsx          # Main import component
├── context/
│   └── CRMContext.tsx         # Updated with bulk import
├── pages/
│   └── Leads.tsx              # Updated with import button
└── types/
    └── index.ts               # Lead interface

supabase/
└── functions/
    └── bulk-import-leads/
        └── index.ts           # Edge function for bulk imports

public/
└── leads_import_template.csv  # Sample template file
```

## Error Handling

### Common Issues
1. **File too large**: Limit is 10MB
2. **Invalid CSV format**: Ensure proper comma separation
3. **Missing required fields**: At least one name field is required
4. **Invalid data types**: Check date formats and numeric values

### Error Messages
- Clear, user-friendly error messages
- Specific guidance on how to fix issues
- Progress feedback during import process

## Performance Considerations

### Small Datasets (< 50 leads)
- Direct Supabase insert
- Immediate UI updates
- Real-time feedback

### Large Datasets (> 50 leads)
- Edge Function processing
- Batch processing (100 leads per batch)
- Background processing with status updates
- Automatic data refresh after completion

## Security

### Data Validation
- Server-side validation in Edge Function
- Input sanitization
- User authentication required

### Access Control
- Row Level Security (RLS) policies
- User-specific data isolation
- Service role access for bulk operations

## Future Enhancements

### Planned Features
1. **Duplicate Detection**: Check for existing leads by email/phone
2. **Advanced Validation**: Custom validation rules
3. **Import History**: Track previous imports
4. **Export Functionality**: Export leads to CSV
5. **Batch Operations**: Update/delete multiple leads
6. **Real-time Progress**: WebSocket updates for large imports

### Technical Improvements
1. **Streaming Upload**: Handle very large files
2. **Background Jobs**: Queue-based processing
3. **Data Transformation**: Advanced field mapping rules
4. **Error Recovery**: Resume failed imports
5. **Analytics**: Import success rates and metrics 