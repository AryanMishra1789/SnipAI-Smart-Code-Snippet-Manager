// GET similar snippets for a snippet
router.get('/:id/similar', async (req, res) => {
  try {
    // Find snippet in our mock database
    const snippet = global.mockDB.snippets.find(s => s._id === req.params.id);
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });
    
    // Find similar snippets
    const similarSnippets = findSimilarSnippets(snippet);
    res.json(similarSnippets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
