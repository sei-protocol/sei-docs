#!/bin/bash

# Path to the seid binary
SEID_PATH=~/go/bin/seid

# Function to extract subcommands from help text blob
extract_subcommands() {
  local cmd=$1
  $cmd --help | awk '/^  [a-zA-Z0-9_-]+/ {print $1}' | grep -v '^-'
}

# Function to generate help documentation for seid command and its subcommands
generate_docs() {
  local for_cmd=$1
  local output_dir=$2
  local full_cmd=$3

  # Determine the name for the output file and directory
  if [[ "$for_cmd" == "$SEID_PATH" ]]; then
    # If it's the initial seid command
    local cmd_name="seid"
    local sub_dir="$output_dir"
    full_cmd="seid"
  else
    local cmd_name=$(echo "$for_cmd" | sed 's/.*seid //')
    local sub_dir="$output_dir/$(echo "$cmd_name" | awk -F ' ' '{for (i=1; i<NF; i++) printf "%s/", $i}')"
    cmd_name=$(echo "$cmd_name" | awk '{print $NF}')
    full_cmd="$full_cmd $cmd_name"
  fi

  local output_file="$sub_dir$cmd_name.md"

  # Create directory if it doesn't exist
  mkdir -p "$sub_dir"

  echo "Generating: $output_file"

  # Add a header and the help command output wrapped in yaml code block for formatting
  {
    echo "### \`$full_cmd\`"
    printf "\`\`\`ansi\n"
    $for_cmd --help
    printf "\n\`\`\`"
  } > "$output_file"

  # Replace the user directory path with ~/
  sed -i '' "s|$(echo ~)|~|g" "$output_file"

  # Extract subcommands and generate their help
  local subcommands
  subcommands=$(extract_subcommands "$for_cmd")
  for subcmd in $subcommands; do
    # Avoid recursion issues by skipping invalid or repeating subcommands like --help, seid, things with commas, and "To"
    [[ "$subcmd" == "seid" || "$subcmd" == *","* || "$subcmd" == *"--"* || "$subcmd" == "To" ]] && continue
    generate_docs "$for_cmd $subcmd" "$output_dir" "$full_cmd"
  done
}

# Function to generate _meta.json file in the given directory
generate_meta() {
  local dir=$1
  local meta_file="$dir/_meta.json"

  echo "Generating _meta.json for $dir"

  # Create _meta.json with filenames as keys and values without the .md extension
  echo "{" > "$meta_file"
  for md_file in "$dir"/*.md; do
    local filename=$(basename "$md_file" .md)
    echo "  \"$filename\": \"$filename\"," >> "$meta_file"
  done
  # Remove the trailing comma and close the JSON object
  sed -i '' '$ s/,$//' "$meta_file"
  echo "}" >> "$meta_file"
}

# Function to recursively generate _meta.json for all directories
generate_meta_for_all() {
  local base_dir=$1
  find "$base_dir" -type d | while read -r dir; do
    generate_meta "$dir"
  done
}

output_dir="./pages/seid"
mkdir -p "$output_dir"

# Generate help for the main seid command
generate_docs "$SEID_PATH" "$output_dir" "seid"

# Generate _meta.json for all directories
generate_meta_for_all "$output_dir"

echo "Seid docs written to $output_dir"
