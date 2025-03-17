#!/bin/bash

# Ensure jq is installed
if ! command -v jq &> /dev/null
then
    echo "jq command could not be found. Install it using 'brew install jq' or 'apt install jq'."
    exit 1
fi

# Ensure correct usage
if [[ $# -ne 2 ]]; then
    echo "Usage: $0 <openapi-json-file> <output-directory>"
    exit 1
fi

# Assign arguments
OPENAPI_FILE="$1"
DOCS_DIR="$2"

# Validate input file
if [[ ! -f "$OPENAPI_FILE" ]]; then
    echo "Error: OpenAPI JSON file '$OPENAPI_FILE' not found."
    exit 1
fi

# Validate output directory (create if not exists)
mkdir -p "$DOCS_DIR"

# Clean the output directory before starting
if [[ -d "$DOCS_DIR" ]]; then
    echo "Cleaning output directory: $DOCS_DIR"
    rm -rf "$DOCS_DIR"/*
fi

# Create temporary directories to store modules and submodules info
mkdir -p "/tmp/api_docs_modules"
mkdir -p "/tmp/api_docs_submodules"

# First pass: Extract all endpoints and create documentation files
jq -r '.paths | keys[]' "$OPENAPI_FILE" | while read -r path; do
    # Convert API path to filesystem-friendly format (replace slashes with dashes, remove braces)
    safe_path=$(echo "$path" | sed 's/{//g; s/}//g; s/\//-/g')

    # Extract module (first segment) and submodule (second segment)
    module=$(echo "$path" | awk -F'/' '{print $2}')
    submodule=$(echo "$path" | awk -F'/' '{print $3}')

    # Track modules and submodules for index generation
    touch "/tmp/api_docs_modules/$module"
    touch "/tmp/api_docs_submodules/${module}_${submodule}"

    # Define directory structure (api/<module>/<submodule>/)
    dir_path="$DOCS_DIR/$module/$submodule"
    mkdir -p "$dir_path"

    # Extract the last part of the API path for the filename (use dashes instead of underscores)
    last_part=$(basename "$path" | sed 's/{//g; s/}//g' | tr '_' '-')

    # Generate a clean title from the route (e.g., "accounts/{account}")
    title=$(echo "$path" | awk -F'/' '{print $(NF-1) "/" $NF}' | sed 's/{/(/g; s/}/)/g')

    # Remove version prefixes (v1beta1/ or v1/) from titles
    title=$(echo "$title" | sed -E 's/\/?(v1beta1|v1)\///g')

    # Iterate through each method in the path
    jq -r ".paths[\"$path\"] | keys[]" "$OPENAPI_FILE" | while read -r method; do
        # MDX file for the endpoint (flat structure inside module/submodule)
        file_path="$dir_path/$last_part.mdx"

        # Extract description
        description=$(jq -r ".paths[\"$path\"][\"$method\"].description // \"\"" "$OPENAPI_FILE")

        # Extract parameters
        parameters=$(jq ".paths[\"$path\"][\"$method\"].parameters // []" "$OPENAPI_FILE")

        # Extract request body schema
        request_body=$(jq ".paths[\"$path\"][\"$method\"].requestBody.content.\"application/json\".schema // {}" "$OPENAPI_FILE")

        # Extract responses
        responses=$(jq ".paths[\"$path\"][\"$method\"].responses // {}" "$OPENAPI_FILE")

        # Write MDX file
        {
            echo "# ${title}"
            echo ""

            # Only include description if it's present
            if [[ -n "$description" && "$description" != "null" ]]; then
                echo "## Description"
                echo "$description"
                echo ""
            fi

            echo "## Endpoint"
            echo "\`\`\`http"
            echo "$method $path"
            echo "\`\`\`"
            echo ""

            # Parameters section
            if [[ "$(echo "$parameters" | jq 'length')" -gt 0 ]]; then
                echo "## Parameters"
                echo "> **Request Parameters**"
                echo ""
                echo "$parameters" | jq -r '.[] | "- **" + .name + "** (" + .in + "): " + (.description // "No description")'
                echo ""
            fi

            # Request Body section
            if [[ "$(echo "$request_body" | jq 'length')" -gt 0 ]]; then
                echo "## Request Body"
                echo "> **Example Request Payload**"
                echo "\`\`\`json"
                echo "$request_body" | jq .
                echo "\`\`\`"
                echo ""
            fi

            # Responses section
            if [[ "$(echo "$responses" | jq 'length')" -gt 0 ]]; then
                echo "## Responses"
                echo "> **Possible Responses**"
                echo ""
                echo "$responses" | jq -r 'keys[] as $k | "- **" + $k + "**: " + (.[$k].description // "No description")'
                echo ""
            fi
        } > "$file_path"

        echo "Generated: $file_path"

        # Create or update _meta.js in the submodule directory
        meta_file="$dir_path/_meta.js"

        # If the file doesn't exist, initialize it
        if [[ ! -f "$meta_file" ]]; then
            echo "export default {" > "$meta_file"
        fi

        # Add the new entry to _meta.js
        echo "  \"$last_part\": { title: \"$title\" }," >> "$meta_file"
    done
done

# Second pass: Generate index files and meta files for proper routing

# Create root _meta.js
root_meta="$DOCS_DIR/_meta.js"
{
    echo "export default {"
    
    for module_file in /tmp/api_docs_modules/*; do
        module=$(basename "$module_file")
        # Capitalize first letter of module name
        module_title=$(echo "$module" | awk '{print toupper(substr($0,1,1))substr($0,2)}')
        echo "  \"$module\": { title: \"$module_title\" },"
    done
    
    # Remove trailing comma
    sed -i '' -e '$ s/,$//' "$root_meta" 2>/dev/null || sed -i -e '$ s/,$//' "$root_meta"
    
    echo "};"
} > "$root_meta"
echo "Generated: $root_meta"

# Generate module index files and _meta.js files
for module_file in /tmp/api_docs_modules/*; do
    module=$(basename "$module_file")
    
    # Create module directory if it doesn't exist
    module_dir="$DOCS_DIR/$module"
    mkdir -p "$module_dir"
    
    # Capitalize first letter of module name
    module_title=$(echo "$module" | awk '{print toupper(substr($0,1,1))substr($0,2)}')
    
    # Create module index.mdx with API card components
    module_index="$module_dir/index.mdx"
    {
        echo "# ${module_title} API"
        echo ""
        echo "This section covers the ${module_title} related endpoints. Choose a category to continue."
        echo ""
        echo "## Categories"
        echo ""
        echo "<div className=\"grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-4\">"
        
        # Get submodules for the current module and create simple card buttons
        for submodule_file in /tmp/api_docs_submodules/${module}_*; do
            if [[ -f "$submodule_file" ]]; then
                sub=$(basename "$submodule_file" | sed "s/${module}_//")
                sub_title=$(echo "$sub" | awk '{print toupper(substr($0,1,1))substr($0,2)}')
                echo "<a href=\"/reference/api/${module}/${sub}\" className=\"nextra-card focus-visible:nextra-focus flex flex-col justify-start overflow-hidden rounded-lg border border-gray-200 text-current no-underline hover:shadow-gray-100 dark:shadow-none dark:hover:shadow-none shadow-gray-100 active:shadow-sm active:shadow-gray-200 transition-all duration-200 hover:border-gray-300 bg-transparent shadow-sm dark:border-neutral-800 hover:bg-slate-50 hover:shadow-md dark:hover:border-neutral-700 dark:hover:bg-neutral-900\">"
                echo "  <span className=\"flex items-center gap-2 p-4 text-gray-700 hover:text-gray-900 after:transition-transform after:duration-75 group-hover:after:translate-x-0.5 group-focus:after:translate-x-0.5 dark:text-neutral-200 dark:hover:text-neutral-50\">"
                echo "    <h3 className=\"m-0 text-base font-semibold\">${sub_title}</h3>"
                echo "  </span>"
                echo "</a>"
            fi
        done
        
        echo "</div>"
    } > "$module_index"
    echo "Generated: $module_index"
    
    # Create module _meta.js
    module_meta="$module_dir/_meta.js"
    {
        echo "export default {"
        echo "  \"index\": { title: \"Overview\" },"
        
        # Add submodules for this module
        for submodule_file in /tmp/api_docs_submodules/${module}_*; do
            if [[ -f "$submodule_file" ]]; then
                sub=$(basename "$submodule_file" | sed "s/${module}_//")
                # Capitalize first letter of submodule name
                sub_title=$(echo "$sub" | awk '{print toupper(substr($0,1,1))substr($0,2)}')
                echo "  \"$sub\": { title: \"$sub_title\" },"
            fi
        done
        
        # Remove trailing comma
        sed -i '' -e '$ s/,$//' "$module_meta" 2>/dev/null || sed -i -e '$ s/,$//' "$module_meta"
        
        echo "};"
    } > "$module_meta"
    echo "Generated: $module_meta"
    
    # Generate submodule index files
    for submodule_file in /tmp/api_docs_submodules/${module}_*; do
        if [[ -f "$submodule_file" ]]; then
            sub=$(basename "$submodule_file" | sed "s/${module}_//")
            
            # Create submodule directory if it doesn't exist
            submodule_dir="$module_dir/$sub"
            mkdir -p "$submodule_dir"
            
            # Capitalize first letter of module and submodule names
            module_title=$(echo "$module" | awk '{print toupper(substr($0,1,1))substr($0,2)}')
            sub_title=$(echo "$sub" | awk '{print toupper(substr($0,1,1))substr($0,2)}')
            
            # Create submodule index.mdx with API card components for endpoints
            submodule_index="$submodule_dir/index.mdx"
            {
                echo "# ${module_title} ${sub_title} API"
                echo ""
                echo "This section covers the ${module_title} ${sub_title} related endpoints. Choose an endpoint to view details."
                echo ""
                
                # Create the list of endpoints
                echo "## Available Endpoints"
                echo ""
                
                # Create grid of simple card buttons
                echo "<div className=\"grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-4\">"
                
                # List files in the directory excluding _meta.js and index.mdx
                for endpoint in "$submodule_dir"/*.mdx; do
                    if [[ -f "$endpoint" && "$(basename "$endpoint")" != "index.mdx" ]]; then
                        endpoint_base=$(basename "$endpoint" .mdx)
                        # Format endpoint name nicely (convert dashes to spaces, capitalize words)
                        endpoint_name=$(echo "$endpoint_base" | tr '-' ' ' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1))substr($i,2)}1')
                        echo " <a href=\"./${sub}/${endpoint_base}\" className=\"nextra-card focus-visible:nextra-focus flex flex-col justify-start overflow-hidden rounded-lg border border-gray-200 text-current no-underline hover:shadow-gray-100 dark:shadow-none dark:hover:shadow-none shadow-gray-100 active:shadow-sm active:shadow-gray-200 transition-all duration-200 hover:border-gray-300 bg-transparent shadow-sm dark:border-neutral-800 hover:bg-slate-50 hover:shadow-md dark:hover:border-neutral-700 dark:hover:bg-neutral-900\">"
                        echo " <span className=\"flex items-center gap-2 p-4 text-gray-700 hover:text-gray-900 after:transition-transform after:duration-75 group-hover:after:translate-x-0.5 group-focus:after:translate-x-0.5 dark:text-neutral-200 dark:hover:text-neutral-50\">"
                        echo " <h3 className=\"m-0 text-base font-semibold\">${endpoint_name}</h3>"
                        echo " </span>"
                        echo " </a>"
                    fi
                done
                
                echo "</div>"
            } > "$submodule_index"
            echo "Generated: $submodule_index"
            
            # Update submodule _meta.js
            submodule_meta="$submodule_dir/_meta.js"
            if [[ -f "$submodule_meta" ]]; then
                # Use a temporary file for modification
                temp_meta="${submodule_meta}.tmp"
                echo "export default {" > "$temp_meta"
                echo "  \"index\": { title: \"Overview\" }," >> "$temp_meta"
                
                # Add existing entries except the first and last line
                sed -n '2,$p' "$submodule_meta" | grep -v "^};" >> "$temp_meta"
                
                # Ensure proper formatting
                sed -i '' -e '$ s/,$//' "$temp_meta" 2>/dev/null || sed -i -e '$ s/,$//' "$temp_meta"
                echo "};" >> "$temp_meta"
                
                # Replace original with temp file
                mv "$temp_meta" "$submodule_meta"
            else
                # Create a new _meta.js
                {
                    echo "export default {"
                    echo "  \"index\": { title: \"Overview\" },"
                    echo "};"
                } > "$submodule_meta"
            fi
            echo "Updated: $submodule_meta"
        fi
    done
done

# Clean up temporary directories
rm -rf "/tmp/api_docs_modules" "/tmp/api_docs_submodules"

# Fix all _meta.js files to ensure they're properly formatted
find "$DOCS_DIR" -name "_meta.js" | while read -r meta_file; do
    # Create a temporary file
    temp_file="${meta_file}.tmp"
    
    # Extract content without duplicate lines
    awk '!seen[$0]++' "$meta_file" > "$temp_file"
    
    # Ensure proper structure
    grep -v '^};$' "$temp_file" > "${temp_file}.2"
    mv "${temp_file}.2" "$temp_file"
    
    # Make sure it ends with a closing brace
    echo "};" >> "$temp_file"
    
    # Replace original with cleaned version
    mv "$temp_file" "$meta_file"
    
    echo "Cleaned: $meta_file"
done

echo "Documentation generation complete!"