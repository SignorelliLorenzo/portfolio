# Remote Space: Archiviazione Cloud Sicura con Crittografia End-to-End

## Panoramica del Progetto

Remote Space è una soluzione di archiviazione cloud focalizzata sulla privacy, costruita come alternativa sicura ai servizi mainstream come Google Drive. Il progetto implementa la **crittografia end-to-end usando AES** (Advanced Encryption Standard), garantendo che i dati degli utenti rimangano privati e inaccessibili a chiunque tranne il proprietario autorizzato—incluso il fornitore del servizio.

## La Sfida della Privacy

I servizi tradizionali di archiviazione cloud memorizzano i file degli utenti in chiaro o utilizzano la crittografia lato server dove il fornitore detiene le chiavi di decrittazione. Questo crea diverse preoccupazioni sulla privacy:

- **Accesso del Fornitore**: I fornitori di servizi possono accedere ai file degli utenti
- **Violazioni dei Dati**: Le compromissioni del server espongono tutti i dati memorizzati
- **Richieste Governative**: Le autorità possono costringere i fornitori a consegnare i dati
- **Dipendenza dalla Fiducia**: Gli utenti devono fidarsi delle pratiche di sicurezza del fornitore

Remote Space affronta questi problemi implementando la **vera crittografia end-to-end**, dove crittografia e decrittazione avvengono esclusivamente lato client.

## Architettura Core

### Crittografia End-to-End con AES

Il sistema utilizza **AES-256** in modalità GCM (Galois/Counter Mode) per la crittografia autenticata:

**Flusso di Crittografia**:
1. L'utente carica un file attraverso l'applicazione client
2. Il client genera una chiave di crittografia unica derivata dalle credenziali utente
3. Il file viene crittografato localmente usando AES-256-GCM
4. Il file crittografato viene caricato sul server
5. Il server memorizza solo il blob crittografato (non può decrittare)

**Flusso di Decrittazione**:
1. L'utente richiede un file
2. Il server invia il blob crittografato al client
3. Il client deriva la chiave di decrittazione dalle credenziali utente
4. Il file viene decrittato localmente e presentato all'utente

**Proprietà Chiave**:
- **Chiavi a 256 bit**: Crittografia forte standard del settore
- **Modalità GCM**: Fornisce sia riservatezza che autenticità
- **Solo lato client**: Le chiavi non lasciano mai il dispositivo dell'utente
- **Zero-knowledge**: Il server non ha conoscenza del contenuto dei file

### Derivazione e Gestione delle Chiavi

La gestione sicura delle chiavi è critica per la crittografia end-to-end:

**Chiave Master Utente**:
- Derivata dalla password utente usando **PBKDF2** (Password-Based Key Derivation Function 2)
- Alto numero di iterazioni (100.000+) per resistere agli attacchi brute-force
- Salt unico per utente memorizzato (ma non la chiave stessa)

**Chiavi di Crittografia File**:
- Ogni file crittografato con una **Data Encryption Key (DEK)** unica
- DEK crittografata con la chiave master dell'utente (key wrapping)
- DEK wrappata memorizzata insieme ai metadati del file crittografato

**Rotazione Chiavi**:
- Gli utenti possono cambiare password senza ri-crittografare tutti i file
- Rotazione della chiave master supportata attraverso key re-wrapping
- Distruzione sicura delle chiavi alla cancellazione dell'account

### Sistema di Archiviazione e Recupero File

Il backend implementa un robusto sistema di gestione file:

**Layer di Archiviazione**:
- Upload chunked per file grandi (upload riprendibili)
- Deduplicazione a livello di chunk crittografato
- Archiviazione efficiente usando content-addressable storage
- Metadati memorizzati separatamente dal contenuto del file

**Ottimizzazione Recupero**:
- Lazy loading per file grandi
- Decrittazione progressiva per streaming
- Caching lato client di file frequentemente accessati
- Ottimizzazione della banda attraverso compressione prima della crittografia

### Autenticazione e Gestione Utenti

Autenticazione sicura senza compromettere la crittografia:

**Registrazione**:
1. L'utente fornisce email e password
2. Il client deriva la chiave master dalla password (mai inviata al server)
3. Token di autenticazione generato dall'hash della password
4. Il server memorizza solo l'hash di autenticazione (non la chiave di crittografia)

**Login**:
1. L'utente inserisce le credenziali
2. Il client deriva la chiave master localmente
3. Hash di autenticazione inviato al server per verifica
4. Token di sessione emesso per richieste successive

**Funzionalità di Sicurezza**:
- Supporto **autenticazione a due fattori** (2FA)
- **Recupero account** attraverso chiavi di backup crittografate
- **Gestione sessioni** con timeout automatico
- **Autorizzazione dispositivi** per dispositivi fidati

### Condivisione Sicura dei File

Condividere file crittografati mantenendo la sicurezza:

**Meccanismo di Condivisione**:
1. Il proprietario genera una **chiave di condivisione** per il file
2. Chiave di condivisione crittografata con la chiave pubblica del destinatario
3. Il destinatario decrittografa la chiave di condivisione con la sua chiave privata
4. Il destinatario può ora decrittare il file condiviso

**Controllo Accessi**:
- **Permessi granulari**: Sola lettura, lettura-scrittura, limitati nel tempo
- **Revoca**: Il proprietario può revocare l'accesso in qualsiasi momento
- **Log di audit**: Tracciare chi ha accessato i file condivisi
- **Condivisione link**: Generare link di condivisione crittografati con password

**Condivisione Zero-Knowledge**:
- Il server non vede mai le chiavi di condivisione in chiaro
- Tutta la crittografia/decrittazione avviene lato client
- I file condivisi rimangono crittografati sul server

## Implementazione Tecnica

### Stack Tecnologico

**Backend (C#)**:
- **ASP.NET Core**: Framework Web API
- **Entity Framework Core**: ORM per database
- **Azure Blob Storage**: Archiviazione file crittografati
- **SQL Server**: Metadati e gestione utenti
- **SignalR**: Notifiche di sincronizzazione in tempo reale

**Applicazione Client**:
- **C# WPF**: Client desktop Windows
- **Xamarin**: Supporto mobile cross-platform
- **Web Client**: Accesso basato su browser (JavaScript crypto)

**Crittografia**:
- **API Crittografia .NET**: Implementazione AES
- **BouncyCastle**: Operazioni crittografiche avanzate
- **Secure Random**: RNG crittograficamente sicuro

### Best Practice di Sicurezza

**Defense in Depth**:
- **TLS 1.3**: Tutta la comunicazione di rete crittografata
- **Certificate Pinning**: Prevenire attacchi man-in-the-middle
- **Validazione Input**: Prevenire attacchi injection
- **Rate Limiting**: Mitigare tentativi brute-force

**Sviluppo Sicuro**:
- **Code Review**: Revisione peer focalizzata sulla sicurezza
- **Analisi Statica**: Scansione automatizzata delle vulnerabilità
- **Penetration Testing**: Audit di sicurezza regolari
- **Gestione Dipendenze**: Mantenere le librerie aggiornate

**Conformità**:
- **GDPR**: Principi di privacy by design
- **Residenza Dati**: Regioni di archiviazione configurabili
- **Diritto alla Cancellazione**: Cancellazione sicura dei dati
- **Audit Trail**: Logging completo

## Accessibilità Cross-Platform

Remote Space fornisce accesso seamless attraverso i dispositivi:

**Applicazione Desktop**:
- Client nativo Windows con set completo di funzionalità
- Modalità offline con crittografia locale
- Sincronizzazione automatica
- Integrazione system tray

**Applicazioni Mobile**:
- Supporto iOS e Android via Xamarin
- Autenticazione biometrica (impronta digitale, Face ID)
- Upload automatico fotocamera (crittografato)
- Accesso file offline

**Interfaccia Web**:
- Accesso basato su browser per qualsiasi piattaforma
- WebCrypto API per crittografia lato client
- Supporto Progressive Web App (PWA)
- Nessun plugin richiesto

**Motore di Sincronizzazione**:
- Sincronizzazione file in tempo reale attraverso dispositivi
- Risoluzione conflitti per modifiche simultanee
- Delta sync efficiente in termini di banda
- Sync selettiva (scegliere quali cartelle sincronizzare)

## Ottimizzazioni delle Prestazioni

La crittografia non deve significare lentezza:

**Ottimizzazione Lato Client**:
- **Accelerazione Hardware**: Usare istruzioni CPU AES-NI
- **Elaborazione Parallela**: Crittografia multi-thread per file grandi
- **Crittografia Streaming**: Crittografare durante l'upload
- **Efficienza Memoria**: Elaborare file in chunk

**Ottimizzazione Lato Server**:
- **Integrazione CDN**: Consegna file globale veloce
- **Caching**: Caching metadati crittografati
- **Load Balancing**: Distribuire il carico di crittografia
- **Indicizzazione Database**: Query metadati veloci

## Funzionalità Privacy

Oltre alla crittografia, Remote Space include funzionalità focalizzate sulla privacy:

**Protezione Metadati**:
- Nomi file crittografati
- Struttura cartelle crittografata
- Pattern di accesso offuscati
- Tempi di upload randomizzati (opzionale)

**Utilizzo Anonimo**:
- Nessun tracking o analytics
- Raccolta metadati minimale
- Account anonimi opzionali
- Nessuna integrazione terze parti

**Sovranità dei Dati**:
- Scegliere la regione di archiviazione
- Opzione self-hosting
- Esportare tutti i dati in qualsiasi momento
- Nessun vendor lock-in

## Casi d'Uso

**Privacy Personale**:
- Archiviare documenti sensibili (registri fiscali, file medici)
- Backup foto e video personali
- Integrazione vault password sicuro
- Journaling privato

**Uso Professionale**:
- Documenti privilegiati avvocato-cliente
- Cartelle cliniche (conformità HIPAA)
- Dati finanziari e contratti
- Protezione proprietà intellettuale

**Collaborazione Team**:
- Condivisione sicura file di progetto
- Drive team crittografati
- Audit trail per conformità
- Controllo accessi basato su ruoli

## Sfide e Soluzioni

**Sfida: Recupero Chiavi**
- **Problema**: Password persa significa dati persi
- **Soluzione**: Chiavi di recupero crittografate, recupero dispositivo fidato, key escrow opzionale

**Sfida: Prestazioni**
- **Problema**: La crittografia aggiunge overhead computazionale
- **Soluzione**: Accelerazione hardware, algoritmi efficienti, caricamento progressivo

**Sfida: Complessità Condivisione**
- **Problema**: La crittografia end-to-end complica la condivisione
- **Soluzione**: Infrastruttura a chiave pubblica, UX intuitiva, scambio chiavi automatizzato

**Sfida: Ricerca**
- **Problema**: Non si possono cercare contenuti file crittografati sul server
- **Soluzione**: Indice di ricerca lato client, tag metadati crittografati

## Miglioramenti Futuri

**Funzionalità Pianificate**:
- **Collaborazione Crittografata**: Editing collaborativo in tempo reale con crittografia
- **Audit Blockchain**: Log di audit immutabili su blockchain
- **Crittografia Quantum-Resistant**: Prepararsi per crittografia post-quantistica
- **Archiviazione Decentralizzata**: Integrazione IPFS per storage distribuito
- **Condivisione Avanzata**: Accesso condizionale (tempo, posizione, dispositivo)

**Direzioni di Ricerca**:
- **Crittografia Omomorfica**: Computare su dati crittografati
- **Crittografia Ricercabile**: Ricerca lato server senza decrittazione
- **Secure Multi-Party Computation**: Analytics collaborativa su dati crittografati

## Risultati Tecnici

- **Architettura Zero-Knowledge**: Il server non accede mai al plaintext
- **Crittografia Cross-Platform**: Sicurezza consistente su tutte le piattaforme
- **Design Scalabile**: Gestisce milioni di file crittografati
- **Sicurezza User-Friendly**: Crittografia complessa con UX semplice
- **Modello di Sicurezza Aperto**: Implementazione crittografia trasparente

## Conclusione

Remote Space dimostra che privacy e convenienza non sono mutuamente esclusive. Implementando la vera crittografia end-to-end con AES, il progetto fornisce un'alternativa sicura all'archiviazione cloud tradizionale mantenendo l'esperienza utente attesa dai moderni servizi di archiviazione file.

Il sistema prova che con un'attenta progettazione architettonica, la crittografia forte può essere resa accessibile agli utenti quotidiani senza richiedere loro di comprendere la complessità sottostante. Remote Space rappresenta un passo verso un internet più rispettoso della privacy dove gli utenti mantengono il controllo sui propri dati.
