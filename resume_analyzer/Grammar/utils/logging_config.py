"""
Logging configuration for the grammar checker.
"""
import logging


def setup_logging():
    """Configure logging for the grammar checker"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )