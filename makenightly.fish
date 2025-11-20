#!/usr/bin/env fish

# Usage:
#   pull_prs.fish 123 456 789

if test (count $argv) -eq 0
    echo "Usage: pull_prs.fish <pr-number> [...]"
    exit 1
end

# Ensure we're in a Git repo
if not git rev-parse --is-inside-work-tree > /dev/null 2>/dev/null
    echo "Error: Not inside a git repository."
    exit 1
end


echo "Pulling PRs into branch: "(git rev-parse --abbrev-ref HEAD)

for pr in $argv
    set pr_branch "pr-$pr"

    echo ""
    echo "=== Fetching PR #$pr ==="
    git fetch upstream pull/$pr/head:$pr_branch

    if test $status -ne 0
        echo "❌ Failed to fetch PR $pr"
        exit 1
    end

    echo "=== Merging PR #$pr (branch $pr_branch) ==="
    git merge $pr_branch

    if test $status -ne 0
        echo ""
        echo "⚠️ Merge conflict for PR $pr!"
        echo "Resolve, then:"
        echo "    git add ."
        echo "    git commit"
        echo "…and re-run the script."
        exit 1
    end

    echo "✅ PR #$pr merged."
end

echo ""
echo "🎉 All PRs merged successfully!"
