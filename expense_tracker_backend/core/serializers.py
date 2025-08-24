from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Wallet, Expense, Budget

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ['id', 'balance']


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'note', 'amount', 'category', 'date']


# serializers.py
class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ['id', 'daily_budget', 'monthly_budget', 'yearly_budget', 'notify_on_threshold']


from .models import Wallet  # Make sure to import

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        Wallet.objects.create(user=user)  # Create wallet with default balance
        return user


    
