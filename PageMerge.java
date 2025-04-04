import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.splitter.TokenTextSplitter;
import org.springframework.ai.document.Document;

import java.io.File;
import java.util.*;
import java.util.regex.Pattern;

public class SmartDynamicPdfChunker {

    public static void main(String[] args) {
        File pdfFile = new File("src/main/resources/your.pdf");

        PagePdfDocumentReader reader = new PagePdfDocumentReader(pdfFile);
        List<Document> pageDocs = reader.get();

        TokenTextSplitter splitter = new TokenTextSplitter(512, 50);
        List<ChunkWithMetadata> finalChunks = new ArrayList<>();

        for (int i = 0; i < pageDocs.size(); i++) {
            Document currentDoc = pageDocs.get(i);
            String currentText = currentDoc.getContent().trim();
            int currentPage = (int) currentDoc.getMetadata().get("pageNumber");

            String mergedText = currentText;
            int endPage = currentPage;

            // Try to merge next page if the current seems incomplete
            if (i + 1 < pageDocs.size()) {
                Document nextDoc = pageDocs.get(i + 1);
                String nextText = nextDoc.getContent().trim();

                if (shouldMerge(currentText, nextText)) {
                    mergedText += "\n" + nextText;
                    endPage = (int) nextDoc.getMetadata().get("pageNumber");
                    i++; // Skip the next page as it's merged
                }
            }

            List<String> chunks = splitter.split(mergedText);
            for (String chunk : chunks) {
                finalChunks.add(new ChunkWithMetadata(chunk, currentPage, endPage));
            }
        }

        for (ChunkWithMetadata chunk : finalChunks) {
            System.out.println("Pages: " + chunk.startPage + (chunk.endPage != chunk.startPage ? "-" + chunk.endPage : ""));
            System.out.println("Chunk:\n" + chunk.text);
            System.out.println("---------------------------------------------------");
        }
    }

    static boolean shouldMerge(String current, String next) {
        String lastLine = current.stripTrailing().replaceAll("[-\\s]+$", "");
        String firstLineNext = next.stripLeading().split("\\s+", 2)[0];

        // Heuristic 1: current does not end with proper punctuation
        boolean noProperEnd = !lastLine.matches(".*[.!?]$");

        // Heuristic 2: next starts with lowercase or transition word
        boolean nextStartsLower = Character.isLowerCase(firstLineNext.charAt(0));
        Set<String> transitionWords = Set.of("and", "but", "because", "so", "therefore", "thus", "for", "also", "then");

        boolean isConnector = transitionWords.contains(firstLineNext.toLowerCase());

        return noProperEnd || nextStartsLower || isConnector;
    }

    static class ChunkWithMetadata {
        String text;
        int startPage;
        int endPage;

        ChunkWithMetadata(String text, int startPage, int endPage) {
            this.text = text;
            this.startPage = startPage;
            this.endPage = endPage;
        }
    }
}
