static boolean shouldMerge(String current, String next) {
    String trimmed = current.stripTrailing();

    // 1. Extract the last non-empty line
    String[] lines = trimmed.split("\n");
    String lastLine = "";
    for (int i = lines.length - 1; i >= 0; i--) {
        if (!lines[i].trim().isEmpty()) {
            lastLine = lines[i].trim();
            break;
        }
    }

    // 2. Check if lastLine ends with digit (and NOT a "Page X" type)
    if (!lastLine.isEmpty()) {
        if (Character.isDigit(lastLine.charAt(lastLine.length() - 1))) {
            // If it's something like "Page 3", ignore this rule
            if (!lastLine.matches("(?i)^page\\s*\\d+$")) {
                return false; // Stop merging
            }
        }
    }

    // 3. First word of next page
    String firstWordNext = next.stripLeading().split("\\s+", 2)[0];

    // 4. Heuristic: no end punctuation
    boolean noProperEnd = !lastLine.matches(".*[.!?]$");

    // 5. Heuristic: next starts lowercase or connector
    boolean nextStartsLower = Character.isLowerCase(firstWordNext.charAt(0));
    Set<String> transitionWords = Set.of("and", "but", "because", "so", "therefore", "thus", "for", "also", "then");
    boolean isConnector = transitionWords.contains(firstWordNext.toLowerCase());

    return noProperEnd || nextStartsLower || isConnector;
}
