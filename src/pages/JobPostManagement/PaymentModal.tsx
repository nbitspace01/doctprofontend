import React, { useState } from "react";
import { Modal, Radio, Button, Input, Form } from "antd";
import { CloseOutlined, CaretUpOutlined } from "@ant-design/icons";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount?: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ open, onClose, amount = 5600 }) => {
  const [paymentMethod, setPaymentMethod] = useState<string>("saved-card-1");
  const [showCardForm, setShowCardForm] = useState<boolean>(false);
  const [form] = Form.useForm();

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      setPaymentMethod("saved-card-1");
      setShowCardForm(false);
      form.resetFields();
    }
  }, [open, form]);

  const handlePaymentMethodChange = (e: any) => {
    const value = e.target.value;
    setPaymentMethod(value);
    
    // Show card form if Credit/Debit Cards option is selected
    if (value === "credit-debit") {
      setShowCardForm(true);
    } else {
      setShowCardForm(false);
    }
  };

  const handleAddNewCard = () => {
    setPaymentMethod("credit-debit");
    setShowCardForm(true);
  };

  const handleProceed = () => {
    if (showCardForm) {
      form.validateFields().then(() => {
        // Handle payment processing
        console.log("Processing payment...");
        onClose();
      });
    } else {
      // Handle payment processing for other methods
      console.log("Processing payment...");
      onClose();
    }
  };

  const handleSaveDraft = () => {
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={600}
      footer={null}
      closeIcon={<CloseOutlined />}
      className="payment-modal"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Payment</h2>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Total Payable Amount</span>
              <CaretUpOutlined className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">(Include all tax)</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">₹{amount.toLocaleString()}</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-6">
          {/* Saved Cards */}
          <div>
            <h3 className="font-semibold mb-3">Saved Cards</h3>
            <Radio.Group
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
              className="w-full"
            >
              <div className="space-y-3">
                <Radio value="saved-card-1" className="w-full">
                  <div className={`flex items-center justify-between w-full p-3 border rounded-lg ${
                    paymentMethod === "saved-card-1" ? "border-green-500" : "border-gray-300"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span>State Bank of India Debit card</span>
                        <span className="text-gray-600">**1234</span>
                        <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">MC</span>
                        </div>
                        <span className="text-gray-600">Surya</span>
                      </div>
                    </div>
                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">SBI</span>
                    </div>
                  </div>
                </Radio>
                <Radio value="saved-card-2" className="w-full">
                  <div className={`flex items-center justify-between w-full p-3 border rounded-lg ${
                    paymentMethod === "saved-card-2" ? "border-green-500" : "border-gray-300"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span>State Bank of India Debit card</span>
                        <span className="text-gray-600">**1234</span>
                        <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">MC</span>
                        </div>
                        <span className="text-gray-600">Surya</span>
                      </div>
                    </div>
                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">SBI</span>
                    </div>
                  </div>
                </Radio>
              </div>
            </Radio.Group>
          </div>

          {/* Credit/Debit Cards */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Credit/Debit Cards</h3>
              {!showCardForm && (
                <button
                  onClick={handleAddNewCard}
                  className="text-blue-600 hover:text-blue-700"
                >
                  + Add New Card
                </button>
              )}
            </div>
            {showCardForm ? (
              <Form form={form} layout="vertical" className="space-y-4">
                <Form.Item
                  label="Card Number*"
                  name="cardNumber"
                  rules={[
                    { required: true, message: "Please enter card number" },
                    { pattern: /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, message: "Invalid card number format" }
                  ]}
                >
                  <Input
                    placeholder="XXXX XXX XXXX XXXX"
                    maxLength={19}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, "").replace(/\D/g, "");
                      const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
                      form.setFieldsValue({ cardNumber: formatted });
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label="Card Holder Name"
                  name="cardHolderName"
                  rules={[{ required: true, message: "Please enter card holder name" }]}
                >
                  <Input placeholder="Enter Location" />
                </Form.Item>
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    label="Exp Date *"
                    name="expDate"
                    rules={[
                      { required: true, message: "Please enter expiry date" },
                      { pattern: /^\d{2}\/\d{2}$/, message: "Format: MM/YY" }
                    ]}
                  >
                    <Input
                      placeholder="MM/YY"
                      maxLength={5}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + "/" + value.slice(2, 4);
                        }
                        form.setFieldsValue({ expDate: value });
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    label="CVV"
                    name="cvv"
                    rules={[
                      { required: true, message: "Please enter CVV" },
                      { pattern: /^\d{3}$/, message: "CVV must be 3 digits" }
                    ]}
                  >
                    <Input
                      placeholder="***"
                      type="password"
                      maxLength={3}
                    />
                  </Form.Item>
                </div>
              </Form>
            ) : (
              <Radio.Group
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
                className="w-full"
              >
                <Radio value="credit-debit" className="w-full">
                  <div className={`flex items-center justify-between w-full p-3 border rounded-lg ${
                    paymentMethod === "credit-debit" ? "border-green-500" : "border-gray-300"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span>State Bank of India Debit card</span>
                        <span className="text-gray-600">**1234</span>
                        <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">MC</span>
                        </div>
                        <span className="text-gray-600">Surya</span>
                      </div>
                    </div>
                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">SBI</span>
                    </div>
                  </div>
                </Radio>
              </Radio.Group>
            )}
          </div>

          {/* UPI */}
          <div>
            <h3 className="font-semibold mb-3">UPI</h3>
            <Radio.Group
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
              className="w-full"
            >
              <Radio value="upi" className="w-full">
                <div className={`flex items-center justify-between w-full p-3 border rounded-lg ${
                  paymentMethod === "upi" ? "border-green-500" : "border-gray-300"
                }`}>
                  <span>Pay by UPI</span>
                  <div className="w-12 h-8 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">UPI</span>
                  </div>
                </div>
              </Radio>
            </Radio.Group>
          </div>

          {/* Net Banking */}
          <div>
            <h3 className="font-semibold mb-3">Net Banking</h3>
            <Radio.Group
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
              className="w-full"
            >
              <Radio value="netbanking" className="w-full">
                <div className={`flex items-center justify-between w-full p-3 border rounded-lg ${
                  paymentMethod === "netbanking" ? "border-green-500" : "border-gray-300"
                }`}>
                  <span>Net Banking</span>
                  <div className="w-12 h-8 bg-gray-400 rounded flex items-center justify-center">
                    <span className="text-white text-xs">🏦</span>
                  </div>
                </div>
              </Radio>
            </Radio.Group>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button
            onClick={handleSaveDraft}
            className="border-blue-600 text-blue-600"
          >
            Save as Draft
          </Button>
          <div className="flex gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleProceed}
              className="bg-button-primary"
            >
              Proceed
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;

