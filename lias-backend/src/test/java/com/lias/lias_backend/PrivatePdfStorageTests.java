package com.lias.lias_backend;
import com.lias.lias_backend.service.PrivatePdfStorage;
import com.lias.lias_backend.exception.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import java.nio.file.Path;
import static org.junit.jupiter.api.Assertions.*;

class PrivatePdfStorageTests {
    @TempDir Path directory;
    @Test void preservesContentAndUsesGeneratedFilename() throws Exception {
        var storage=new PrivatePdfStorage(directory.toString());
        byte[] pdf="%PDF-1.4\nexample\n%%EOF".getBytes();
        String key=storage.save(new MockMultipartFile("cv","../../cv.pdf","application/pdf",pdf));
        assertTrue(key.matches("[0-9a-f-]{36}\\.pdf"));
        assertArrayEquals(pdf,storage.read(key).getContentAsByteArray());
        storage.delete(key);
        assertThrows(ResourceNotFoundException.class,()->storage.read(key));
    }
    @Test void rejectsSpoofedEmptyOversizedFilesAndTraversal() {
        var storage=new PrivatePdfStorage(directory.toString());
        assertThrows(BusinessException.class,()->storage.save(new MockMultipartFile("cv","cv.pdf","application/pdf","not pdf".getBytes())));
        assertThrows(BusinessException.class,()->storage.save(new MockMultipartFile("cv","cv.pdf","application/pdf",new byte[0])));
        assertThrows(BusinessException.class,()->storage.save(new MockMultipartFile("cv","cv.pdf","application/pdf",new byte[5*1024*1024+1])));
        assertThrows(ResourceNotFoundException.class,()->storage.read("../../application.properties"));
    }
}
