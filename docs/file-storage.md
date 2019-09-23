# File storage

## Directory and file structure


### Legend

🍉 Bucket  
📂 Folder  
📄 File  
🖼 Image  
🎞 Video  
📦 Zip file

### Structure

    🍉 maiara
        📂 assistants
            📂 <assistant-id>
                📄 info.json
                📂 environments
                    📄 dev.json
                    📄 prod.json
                    📄 ...
        📂 skills
            📂 <skill-id>
                📂 <skill-version>
                    📄 info.json
                    📂 <language>
                        📂 dataset
                            📄 info.json
                            📂 intents
                                📄 intent1.json
                                📄 intent2.json
                                📄 ...
                            📂 entities
                                📄 entity1.json
                                📄 entity2.json
                                📄 ...
                            📦 train.zip
                        📂 dialog
                            📂 nodes
                                📄 node1.json
                                📄 node2.json
                                📄 ...
                            📄 edges.json
