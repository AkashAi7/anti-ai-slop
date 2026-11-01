# Hints

1. Good `/clarify` questions name an assumption the code already makes, for example "the starter adds the percentages together; is that intended?"
2. Integer cents means the function never returns a fraction. Floor the discount amount, then subtract it from the total.
3. ISO dates sort correctly as text, so `today > expires` is enough to detect an expired code. The expiry day itself is still valid.
