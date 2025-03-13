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

# Iterate through all paths
jq -r '.paths | keys[]' "$OPENAPI_FILE" | while read -r path; do
    # Convert API path to filesystem-friendly format (replace slashes with dashes, remove braces)
    safe_path=$(echo "$path" | sed 's/{//g; s/}//g; s/\//-/g')

    # Extract module (first segment) and submodule (second segment)
    module=$(echo "$path" | awk -F'/' '{print $2}')
    submodule=$(echo "$path" | awk -F'/' '{print $3}')

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

        # **Write or Update `_meta.js` in the same directory**
        meta_file="$dir_path/_meta.js"

        # If the file doesn't exist, initialize it
        if [[ ! -f "$meta_file" ]]; then
            echo "export default {" > "$meta_file"
        fi

        # Add the new entry to `_meta.js`
        echo "  \"$last_part\": { title: \"$title\" }," >> "$meta_file"
    done
done

# **Ensure `_meta.js` files are properly closed with closing brace**
find "$DOCS_DIR" -name "_meta.js" | while read -r meta_file; do
    # Remove the last comma before closing brace
    sed -i '' -e '$ s/,$//' "$meta_file"  # macOS (use `sed -i '$ s/,$//' "$meta_file"` on Linux)

    # Append closing brace if it's missing
    echo "};" >> "$meta_file"

    echo "Updated: $meta_file"
done
