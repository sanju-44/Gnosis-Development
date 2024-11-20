from openai import OpenAI

client = OpenAI(
  base_url = "https://integrate.api.nvidia.com/v1",
  api_key = "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"
)

completion = client.chat.completions.create(
  model="nvidia/llama-3.1-nemotron-70b-instruct",
  messages=[{"role":"user","content":"solidity how proxy contract works"}],
  temperature=0.5,
  top_p=1,
  max_tokens=4000,
  stream=True
)

for chunk in completion:
  if chunk.choices[0].delta.content is not None:
    print(chunk.choices[0].delta.content, end="")
