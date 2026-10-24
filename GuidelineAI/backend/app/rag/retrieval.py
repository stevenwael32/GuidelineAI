"""
Chroma retrieval.

Direct port of the notebook's final retrieve() function (cell 100):
query the Chroma collection, then re-derive cosine similarity by
dotting the (normalized) query embedding against each retrieved
chunk's stored embedding — exactly as the notebook does, rather than
trusting Chroma's raw distance metric alone.
"""

from typing import Dict, List

import numpy as np


def retrieve(collection, embedding_model, query: str, top_k: int) -> List[Dict]:
    query_embedding = embedding_model.encode_one(query)

    results = collection.query(
        query_embeddings=[query_embedding.tolist()],
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
    )

    ids = results["ids"][0] if results["ids"] else []
    if not ids:
        return []

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = [float(d) for d in results["distances"][0]]

    stored = collection.get(ids=ids, include=["embeddings"])
    stored_embeddings = stored["embeddings"]
    # Chroma returns stored embeddings in its own id order; realign to
    # the query result order using the id list it returned for `get`.
    stored_ids = stored["ids"]
    embedding_by_id = {sid: np.array(vec) for sid, vec in zip(stored_ids, stored_embeddings)}

    retrieved = []
    for i, chunk_id in enumerate(ids):
        chunk_embedding = embedding_by_id[chunk_id]
        similarity = float(np.dot(query_embedding, chunk_embedding))
        retrieved.append(
            {
                "id": chunk_id,
                "text": documents[i],
                "metadata": metadatas[i],
                "distance": distances[i],
                "similarity": similarity,
                "similarity_percent": similarity * 100,
            }
        )

    return retrieved
