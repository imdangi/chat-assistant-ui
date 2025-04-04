static boolean shouldMerge(String current, String next) {
    String trimmed = current.stripTrailing();
    String[] lines = trimmed.split("\n");

    // 1. Get last non-empty, non-footer content line
    String lastContentLine = "";
    for (int i = lines.length - 1; i >= 0; i--) {
        String line = lines[i].trim();
        if (line.isEmpty()) continue;

        // Skip lines like "Page 3" or "Page 4 of 10"
        if (line.matches("(?i)^page\\s*\\d+(\\s*of\\s*\\d+)?$")) {
            continue;
        }

        lastContentLine = line;
        break;
    }

    // 2. Rule: if lastContentLine ends with digit (and not a "Page" footer), don't merge
    if (!lastContentLine.isEmpty()) {
        char lastChar = lastContentLine.charAt(lastContentLine.length() - 1);
        if (Character.isDigit(lastChar)) {
            return false;
        }
    }

    // 3. Rule: check if lastContentLine ends with punctuation
    boolean noProperEnd = !lastContentLine.matches(".*[.!?]$");

    // 4. First word of next page
    String firstWordNext = next.stripLeading().split("\\s+", 2)[0];
    boolean nextStartsLower = Character.isLowerCase(firstWordNext.charAt(0));

    // 5. Transition words
    Set<String> transitionWords = Set.of("and", "but", "because", "so", "therefore", "thus", "for", "also", "then");
    boolean isConnector = transitionWords.contains(firstWordNext.toLowerCase());

    return noProperEnd || nextStartsLower || isConnector;
}
