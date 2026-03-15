import os
import django
import sys
from unittest.mock import MagicMock, patch

# Configure Django environment
sys.path.append(os.path.join(os.getcwd(), 'src'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'src.core.settings')
django.setup()

from src.modules.auth.services import ClerkService
from src.modules.auth.models import Cliente

def verify_sync():
    print("Starting Clerk Sync Verification...")
    
    clerk_id = "user_test_123"
    email = "test@example.com"
    name = "Test User"
    
    # Mock the Clerk SDK user object
    mock_user = MagicMock()
    mock_user.email_addresses = [MagicMock(email_address=email)]
    mock_user.first_name = "Test"
    mock_user.last_name = "User"
    
    service = ClerkService()
    
    with patch.object(service.sdk.users, 'get', return_value=mock_user):
        print(f"Mocking Clerk user fetching for {clerk_id}...")
        cliente = service.sync_user(clerk_id)
        
        if cliente and cliente.clerk_id == clerk_id and cliente.email == email:
            print(f"SUCCESS: Cliente synced: {cliente}")
        else:
            print(f"FAILURE: Sync returned: {cliente}")
            return False

    # Verify database record
    db_cliente = Cliente.objects.filter(clerk_id=clerk_id).first()
    if db_cliente:
        print(f"SUCCESS: Record found in DB: {db_cliente.name}")
    else:
        print("FAILURE: Record not found in DB")
        return False
        
    return True

if __name__ == "__main__":
    if verify_sync():
        print("\nVerification completed successfully!")
        sys.exit(0)
    else:
        print("\nVerification failed!")
        sys.exit(1)
