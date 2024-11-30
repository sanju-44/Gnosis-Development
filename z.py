# from openai import OpenAI

# client = OpenAI(
#   base_url = "https://integrate.api.nvidia.com/v1",
#   api_key = "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"
# )

# completion = client.chat.completions.create(
#   model="nvidia/llama-3.1-nemotron-70b-instruct",
#   messages=[{"role":"user","content":"solidity how proxy contract works"}],
#   temperature=0.5,
#   top_p=1,
#   max_tokens=4000,
#   stream=True
# )

# for chunk in completion:
#   if chunk.choices[0].delta.content is not None:
#     print(chunk.choices[0].delta.content, end="")



# pip install cryptography==43.0.1


from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
import os

def encrypt_data(data, key):
    # Ensure key is 32 bytes (AES-256)
    key = key.ljust(32)[:32].encode('utf-8')  # Pad or trim the key to be exactly 32 bytes

    # Generate a random 16-byte IV (Initialization Vector)
    iv = os.urandom(16)

    # Initialize cipher
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()

    # Pad data to be AES block size
    padder = padding.PKCS7(algorithms.AES.block_size).padder()
    padded_data = padder.update(data.encode('utf-8')) + padder.finalize()

    # Encrypt the data
    ciphertext = encryptor.update(padded_data) + encryptor.finalize()

    return ciphertext  # Return the IV and ciphertext together

def decrypt_data(ciphertext, key):
    # Ensure key is 32 bytes (AES-256)
    key = key.ljust(32)[:32].encode('utf-8')

    # Extract the IV from the beginning of the ciphertext
    iv = ciphertext[:16]
    actual_ciphertext = ciphertext[16:]

    # Initialize cipher for decryption
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()

    # Decrypt the data
    padded_data = decryptor.update(actual_ciphertext) + decryptor.finalize()

    # Unpad the decrypted data
    unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder()
    data = unpadder.update(padded_data) + unpadder.finalize()

    return data.decode('utf-8')

# Example usage
data = "Sensitive Data"
key = "YourSecretKey"

# Encrypt the data
ciphertext = encrypt_data(data, key)
print("Encrypted:", ciphertext)

# Decrypt the data
decrypted_data = decrypt_data(ciphertext, key)
print("Decrypted:", decrypted_data)
