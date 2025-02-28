import threading
import time
import logging
from config import CACHE_EXPIRY_SECONDS, CACHE_CLEANUP_INTERVAL

logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self):
        self.cache = {}
        self.lock = threading.Lock()
        # Start the cache cleanup thread
        threading.Thread(target=self._cleanup_cache_periodically, daemon=True).start()

    def _cleanup_cache_periodically(self):
        """Periodically clean up the cache to prevent memory leaks"""
        while True:
            time.sleep(CACHE_CLEANUP_INTERVAL)  # Run periodically
            with self.lock:
                current_time = time.time()
                keys_to_remove = [k for k, v in self.cache.items() 
                                if current_time - v['timestamp'] > CACHE_EXPIRY_SECONDS]
                for key in keys_to_remove:
                    del self.cache[key]
                logger.info(f"Cache cleanup: removed {len(keys_to_remove)} items")

    def get(self, key):
        """Get an item from the cache"""
        with self.lock:
            if key in self.cache:
                logger.info(f"Cache hit for key {key}")
                return self.cache[key]
            return None

    def set(self, key, value):
        """Set an item in the cache"""
        with self.lock:
            self.cache[key] = {
                **value,
                'timestamp': time.time()
            }
            
# Global cache instance
cache_manager = CacheManager()