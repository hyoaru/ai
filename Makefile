.PHONY: link

link:
	@echo "Installing AI configurations..."
	@./.link.sh
	@echo "Installation complete."

unlink:
	@echo "Removing AI configurations..."
	@./.link.sh remove
	@echo "Removal complete."
