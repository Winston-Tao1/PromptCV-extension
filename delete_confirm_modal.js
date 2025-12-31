// Delete Confirmation Modal JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteBtn = document.getElementById('delete-btn');

    // Cancel button
    cancelBtn.addEventListener('click', function() {
        // Send message to parent window to cancel deletion
        window.parent.postMessage({
            type: 'delete_confirmation',
            action: 'cancel'
        }, '*');
    });

    // Delete button
    deleteBtn.addEventListener('click', function() {
        // Send message to parent window to confirm deletion
        window.parent.postMessage({
            type: 'delete_confirmation',
            action: 'confirm'
        }, '*');
    });

    // Handle Enter key for delete, Escape for cancel
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            deleteBtn.click();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelBtn.click();
        }
    });

    // Focus delete button by default
    deleteBtn.focus();
});
